// components/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

type RawUser = {
  id: number | string;
  email: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  shipping_address?: string;
  billing_address?: string;
  marketing_consent?: boolean;
};

export interface User {
  id: number | string;
  email: string;
  name: string;
  isAdmin: boolean;
  raw: RawUser;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
  setAuthManually: (user: RawUser, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (u: RawUser): User => ({
  id: u.id,
  email: u.email,
  name: [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email,
  isAdmin: (u.role || "").toLowerCase() === "admin",
  raw: u,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setUser(null);
      setToken(null);
      return;
    }
    try {
      const { data } = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const raw: RawUser = data?.user ?? data; // tolerate either shape
      const normalized = normalizeUser(raw);
      setUser(normalized);
      setToken(t);
      // cache raw user
      localStorage.setItem("user", JSON.stringify(raw));
      // optional: set default header for future api calls
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common.Authorization;
    }
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      api.defaults.headers.common.Authorization = `Bearer ${t}`;
      refreshProfile();
    } else {
      const cached = localStorage.getItem("user");
      if (cached) {
        try {
          setUser(normalizeUser(JSON.parse(cached)));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
  }, [refreshProfile]);

  const loginWithCredentials = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/signin", { email, password });
    const newToken: string = data?.token || data?.accessToken || data?.jwt;
    const raw: RawUser = data?.user || {};
    if (!newToken) throw new Error("Login failed: missing token");

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(raw));
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(normalizeUser(raw));
  }, []);

  const setAuthManually = (raw: RawUser, t: string) => {
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(raw));
    api.defaults.headers.common.Authorization = `Bearer ${t}`;
    setToken(t);
    setUser(normalizeUser(raw));
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common.Authorization;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loginWithCredentials, refreshProfile, logout, setAuthManually }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
