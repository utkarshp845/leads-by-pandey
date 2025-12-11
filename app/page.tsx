"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProspectForm from "@/components/ProspectForm";
import ProspectList from "@/components/ProspectList";
import StrategyPanel from "@/components/StrategyPanel";
import { Prospect, StrategyResponse, SavedProspect } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { createSavedProspect } from "@/lib/storage";

export default function Home() {
  // ALL HOOKS MUST BE CALLED FIRST - NO EARLY RETURNS BEFORE THIS
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [prospects, setProspects] = useState<SavedProspect[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [currentProspect, setCurrentProspect] = useState<Prospect>({
    name: "",
    title: "",
    company: "",
    industry: "",
    notes: "",
    knownPainPoints: "",
    links: [],
    priorInteractions: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Memoized functions to prevent unnecessary re-renders
  const getAuthToken = useCallback(async (): Promise<string> => {
    if (typeof window === "undefined") {
      throw new Error("Not authenticated");
    }
    
    // Try sessionStorage first (faster)
    const sessionToken = sessionStorage.getItem("auth-token");
    if (sessionToken) {
      return sessionToken;
    }
    
    // Fallback: get from API (handles httpOnly cookies)
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          sessionStorage.setItem("auth-token", data.token);
          return data.token;
        }
      } else if (response.status === 401) {
        // Token expired, redirect to login
        router.push("/login");
        throw new Error("Session expired");
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Session expired") {
        throw err;
      }
      console.error("Error getting auth token:", err);
    }
    
    throw new Error("Not authenticated");
  }, [router]);

  const loadProspectsFromAPI = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = await getAuthToken();
      const response = await fetch("/api/prospects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProspects(data.prospects || []);
      } else if (response.status === 401) {
        // Token expired, redirect to login
        router.push("/login");
      }
    } catch (error) {
      console.error("Error loading prospects:", error);
    }
  }, [user, getAuthToken, router]);

  const saveProspectsToAPI = useCallback(async (prospectsToSave: SavedProspect[]) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const token = await getAuthToken();
      const response = await fetch("/api/prospects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prospects: prospectsToSave }),
      });

      if (!response.ok && response.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error saving prospects:", error);
    } finally {
      setIsSaving(false);
    }
  }, [user, getAuthToken, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load prospects from API on mount and when user changes
  useEffect(() => {
    if (user) {
      loadProspectsFromAPI();
    }
  }, [user, loadProspectsFromAPI]);

  // Auto-save prospects to API whenever they change (debounced)
  useEffect(() => {
    if (user && prospects.length >= 0) {
      // Only save if there are actual changes (not initial load)
      const timeoutId = setTimeout(() => {
        saveProspectsToAPI(prospects);
      }, 1500); // Increased debounce for better performance
      return () => clearTimeout(timeoutId);
    }
  }, [prospects, user, saveProspectsToAPI]);

  // Update current prospect when selection changes
  useEffect(() => {
    if (selectedProspectId) {
      const prospect = prospects.find((p) => p.id === selectedProspectId);
      if (prospect) {
        setCurrentProspect({
          name: prospect.name,
          title: prospect.title,
          company: prospect.company,
          industry: prospect.industry,
          notes: prospect.notes,
          knownPainPoints: prospect.knownPainPoints,
          links: prospect.links,
          priorInteractions: prospect.priorInteractions,
        });
      }
    } else {
      setCurrentProspect({
        name: "",
        title: "",
        company: "",
        industry: "",
        notes: "",
        knownPainPoints: "",
        links: [],
        priorInteractions: "",
      });
    }
  }, [selectedProspectId, prospects]);

  // Memoized selected prospect
  const selectedProspect = useMemo(() => {
    return selectedProspectId
      ? prospects.find((p) => p.id === selectedProspectId) || null
      : null;
  }, [selectedProspectId, prospects]);

  const handleLogout = useCallback(async () => {
    await logout();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth-token");
    }
    router.push("/login");
  }, [logout, router]);

  const handleNewProspect = useCallback(() => {
    setSelectedProspectId(null);
    setCurrentProspect({
      name: "",
      title: "",
      company: "",
      industry: "",
      notes: "",
      knownPainPoints: "",
      links: [],
      priorInteractions: "",
    });
  }, []);

  const handleSelectProspect = useCallback((id: string) => {
    setSelectedProspectId(id);
  }, []);

  const handleSaveProspect = useCallback(() => {
    if (!currentProspect.name.trim() || !currentProspect.company.trim()) {
      return;
    }

    if (selectedProspectId) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === selectedProspectId
            ? {
                ...p,
                ...currentProspect,
              }
            : p
        )
      );
    } else {
      const newProspect = createSavedProspect(currentProspect);
      setProspects((prev) => [...prev, newProspect]);
      setSelectedProspectId(newProspect.id);
    }
  }, [currentProspect, selectedProspectId]);

  const handleDeleteProspect = useCallback((id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProspectId === id) {
      setSelectedProspectId(null);
      setCurrentProspect({
        name: "",
        title: "",
        company: "",
        industry: "",
        notes: "",
        knownPainPoints: "",
        links: [],
        priorInteractions: "",
      });
    }
  }, [selectedProspectId]);

  const generateStrategyForProspect = useCallback(async (prospectId: string) => {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (!prospect) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mr-pandey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: prospect.name,
          title: prospect.title,
          company: prospect.company,
          industry: prospect.industry,
          notes: prospect.notes,
          knownPainPoints: prospect.knownPainPoints,
          links: prospect.links,
          priorInteractions: prospect.priorInteractions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate strategy");
      }

      const strategy: StrategyResponse = await response.json();

      setProspects((prev) =>
        prev.map((p) =>
          p.id === prospectId
            ? {
                ...p,
                strategy,
                strategyGeneratedAt: Date.now(),
              }
            : p
        )
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while asking Mr. Pandey. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [prospects]);

  const handleAskMrPandey = useCallback(async () => {
    if (!selectedProspectId) {
      if (!currentProspect.name.trim() || !currentProspect.company.trim()) {
        return;
      }
      
      const newProspect = createSavedProspect(currentProspect);
      const updatedProspects = [...prospects, newProspect];
      setProspects(updatedProspects);
      setSelectedProspectId(newProspect.id);
      
      await generateStrategyForProspect(newProspect.id);
      return;
    }

    const prospect = prospects.find((p) => p.id === selectedProspectId);
    if (!prospect) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === selectedProspectId
            ? {
                ...p,
                ...currentProspect,
              }
            : p
        )
      );
    }

    await generateStrategyForProspect(selectedProspectId);
  }, [selectedProspectId, currentProspect, prospects, generateStrategyForProspect]);

  const handleRegenerateStrategy = useCallback(() => {
    if (selectedProspectId) {
      generateStrategyForProspect(selectedProspectId);
    }
  }, [selectedProspectId, generateStrategyForProspect]);

  // NOW we can do conditional returns - all hooks are called
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-yellow-500 mb-4"></div>
          <p className="text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                <span className="text-black font-bold text-xl">PS</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-1">
                  Pandey Solutions
                </h1>
                <p className="text-gray-300 text-base md:text-lg">
                  AI-powered lead generation strategy with Mr. Pandey
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="h-3 w-3 border-2 border-gray-700 border-t-yellow-500 rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-yellow-500">{user.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[150px]">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-yellow-500 hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap border border-gray-700"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - 3 Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-10rem)]">
          {/* Left Panel - Prospect List (Sidebar) */}
          <div className="lg:col-span-3 h-full min-h-[300px] lg:min-h-0">
            <ProspectList
              prospects={prospects}
              selectedProspectId={selectedProspectId}
              onSelectProspect={handleSelectProspect}
              onNewProspect={handleNewProspect}
              onDeleteProspect={handleDeleteProspect}
            />
          </div>

          {/* Middle Panel - Prospect Form */}
          <div className="lg:col-span-4 h-full min-h-[400px] lg:min-h-0">
            <ProspectForm
              prospect={currentProspect}
              prospectId={selectedProspectId}
              onProspectChange={setCurrentProspect}
              onSaveProspect={handleSaveProspect}
              onAskMrPandey={handleAskMrPandey}
              isLoading={isLoading}
            />
          </div>

          {/* Right Panel - Strategy Display */}
          <div className="lg:col-span-5 h-full min-h-[400px] lg:min-h-0">
            <StrategyPanel
              strategy={selectedProspect?.strategy || null}
              strategyGeneratedAt={selectedProspect?.strategyGeneratedAt || null}
              isLoading={isLoading}
              error={error}
              onRegenerate={
                selectedProspect?.strategy ? handleRegenerateStrategy : undefined
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

