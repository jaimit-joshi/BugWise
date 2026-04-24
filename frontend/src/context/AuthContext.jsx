import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("bw_token"));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("bw_token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("bw_token");
    }
  }, [token]);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/api/auth/me`);
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    if (res.data.success) {
      setToken(res.data.data.token);
      setUser(res.data.data.user);
      return { success: true };
    }
    return { success: false, error: res.data.error };
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const res = await axios.post(`${API}/api/auth/signup`, { name, email, password });
    if (res.data.success) {
      setToken(res.data.data.token);
      setUser(res.data.data.user);
      return { success: true };
    }
    return { success: false, error: res.data.error };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
