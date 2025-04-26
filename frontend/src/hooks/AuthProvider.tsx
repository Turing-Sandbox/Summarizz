import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "../models/User";
import { fetchUser } from "../services/userService";

// TODO: REVIEW THE AUTH PROVIDER TO IMPROVE SECURITY
export default function AuthProvider({
  children,
}: React.PropsWithChildren<object>) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (newToken: string, userUID: string) => {
    const userData = await fetchUser(userUID);

    setToken(newToken);
    if (!(userData instanceof Error)) {
      setUser(userData || null);
    } else {
      console.error("Failed to fetch user:", userData);
      setUser(null);
    }

    // TODO: Set a session cookie from backend instead of here
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // TODO: Call backend logout endpoint
  };

  useEffect(() => {
    // TODO: fetch from a refresh endpoint (via httpOnly cookie) on load
    const initializeUser = async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
          setUser(data.user);
        }
      } catch (err) {
        console.error("Auto-login failed", err);
      }
    };

    initializeUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
