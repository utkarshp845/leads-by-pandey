"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      // Try to get token from localStorage first
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
      
      // Make request with credentials to include cookies, and token in header if available
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }
      
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Update stored token if we got a new one
        if (data.token && typeof window !== "undefined") {
          localStorage.setItem("auth-token", data.token);
        }
      } else {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-token");
        }
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    setUser(data.user);
    // Store token in localStorage for persistent sessions and API calls
    if (data.token) {
      localStorage.setItem("auth-token", data.token);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    setUser(data.user);
    // Store token in localStorage for persistent sessions and API calls
    if (data.token) {
      localStorage.setItem("auth-token", data.token);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("auth-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

