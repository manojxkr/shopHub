/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

function normalizeRole(role) {
  if (!role) return null;
  if (role.startsWith("ROLE_")) return role;
  return `ROLE_${role}`;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [loading, setLoading] = useState(true);
  const isAuthenticated = Boolean(token);

  const refreshRole = useCallback(async () => {
    const detected = await authService.detectRole();
    const normalized = normalizeRole(detected);
    setRole(normalized);
    if (normalized) localStorage.setItem("role", normalized);
    else localStorage.removeItem("role");
    return normalized;
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        if (!role) {
          const detected = await authService.detectRole();
          if (!cancelled) {
            const normalized = normalizeRole(detected);
            setRole(normalized);
            if (normalized) localStorage.setItem("role", normalized);
          }
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setToken(null);
          setRole(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [token, role]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const { token: t } = await authService.login({ email, password });
      localStorage.setItem("token", t);
      setToken(t);
      const r = await refreshRole();
      return r;
    } finally {
      setLoading(false);
    }
  }, [refreshRole]);

  async function register({ name, email, password, role }) {
    const normalized = normalizeRole(role)?.replace("ROLE_", "");
    return await authService.register({ name, email, password, role: normalized });
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Full reload to catalog: clears in-memory auth and avoids any flash of protected routes.
    window.location.replace("/");
  }

  const value = useMemo(
    () => ({
      token,
      role,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      refreshRole,
    }),
    [token, role, loading, isAuthenticated, login, refreshRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

