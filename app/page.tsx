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
  const [activeTab, setActiveTab] = useState<"strategy" | "prospects">("strategy");

  // Memoized functions to prevent unnecessary re-renders
  const getAuthToken = useCallback(async (): Promise<string> => {
    if (typeof window === "undefined") {
      throw new Error("Not authenticated");
    }
    
    // Try localStorage first (persistent across sessions)
    const storedToken = localStorage.getItem("auth-token");
    
    if (storedToken) {
      return storedToken;
    }
    
    // Fallback: get from API (handles httpOnly cookies)
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem("auth-token", data.token);
          return data.token;
        }
      } else if (response.status === 401) {
        // Token expired, clear and redirect to login
        localStorage.removeItem("auth-token");
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
      localStorage.removeItem("auth-token");
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
      const token = await getAuthToken();
      
      const response = await fetch("/api/mr-pandey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
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
  }, [prospects, getAuthToken]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 ring-2 ring-yellow-500/20">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-yellow-500 mb-4"></div>
          <p className="text-gray-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/50 ring-2 ring-yellow-500/20">
                <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-500 mb-0.5 leading-tight tracking-tight">
                  Leads
                </h1>
                <p className="text-sm md:text-base text-gray-400 font-medium -mt-1 tracking-wide">
                  by Pandey
                </p>
                <p className="text-gray-400 text-xs md:text-sm mt-2 font-light">
                  AI-powered lead generation strategies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isSaving && (
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                  <div className="h-3 w-3 border-2 border-gray-600 border-t-yellow-500 rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              )}
              <div className="text-right hidden sm:block bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <p className="text-sm font-semibold text-yellow-500">{user.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[150px]">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-yellow-500 hover:bg-gray-800 rounded-lg transition-all whitespace-nowrap border border-gray-700 hover:border-yellow-500/50"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab("strategy")}
              className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                activeTab === "strategy"
                  ? "text-yellow-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Strategy
              </span>
              {activeTab === "strategy" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("prospects")}
              className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                activeTab === "prospects"
                  ? "text-yellow-500"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Prospects ({prospects.length})
              </span>
              {activeTab === "prospects" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content - Tab Views */}
        {activeTab === "strategy" ? (
          /* Strategy Tab - Prospect Form + Strategy Panel */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[600px]">
            {/* Left Panel - Prospect Form */}
            <div className="h-full">
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
            <div className="h-full">
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
        ) : (
          /* Prospects Tab - Prospect List */
          <div className="h-[calc(100vh-16rem)] min-h-[400px]">
            <ProspectList
              prospects={prospects}
              selectedProspectId={selectedProspectId}
              onSelectProspect={(id) => {
                handleSelectProspect(id);
                setActiveTab("strategy");
              }}
              onNewProspect={() => {
                handleNewProspect();
                setActiveTab("strategy");
              }}
              onDeleteProspect={handleDeleteProspect}
            />
          </div>
        )}
      </div>
    </main>
  );
}

