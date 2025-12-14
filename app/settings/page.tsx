"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { MrPandeyAssistant } from "@/components/MrPandeyAssistant";

type Tab = "profile" | "notifications" | "ai" | "export" | "account";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
    }
    router.push("/login");
  };

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        showToast("Profile updated successfully", "success");
        window.location.reload(); // Refresh to get updated user data
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to update profile", "error");
      }
    } catch (error) {
      showToast("Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/settings/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        showToast("Password updated successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to update password", "error");
      }
    } catch (error) {
      showToast("Failed to update password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-yellow-500 mb-2">Settings</h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="secondary" size="sm">
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Main
                  </span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {[
                  { id: "profile" as Tab, label: "Profile" },
                  { id: "notifications" as Tab, label: "Notifications" },
                  { id: "ai" as Tab, label: "AI Preferences" },
                  { id: "export" as Tab, label: "Export" },
                  { id: "account" as Tab, label: "Account" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                        : "text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-500 mb-4">Profile</h2>
                    <div className="space-y-4">
                      <Input
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                      <Button onClick={handleUpdateProfile} isLoading={isLoading}>
                        Update Profile
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-700">
                    <h3 className="text-xl font-bold text-yellow-500 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <Input
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <Button onClick={handleChangePassword} isLoading={isLoading}>
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500 mb-4">Notifications</h2>
                  <p className="text-gray-400">Notification preferences coming soon</p>
                </div>
              )}

              {activeTab === "ai" && (
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500 mb-4">AI Preferences</h2>
                  <p className="text-gray-400">AI model preferences coming soon</p>
                </div>
              )}

              {activeTab === "export" && (
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500 mb-4">Export Settings</h2>
                  <p className="text-gray-400">Export preferences coming soon</p>
                </div>
              )}

              {activeTab === "account" && (
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500 mb-4">Account</h2>
                  <div className="space-y-4">
                    <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                      Delete Account
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => {}}>
            Delete Account
          </Button>
        </div>
      </Modal>

      <MrPandeyAssistant context="default" />
      <ToastContainer />
    </main>
  );
}

