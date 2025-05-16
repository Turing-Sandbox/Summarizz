import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "../models/User";
import { fetchUser } from "../services/userService";
import axios from "axios";
import { apiURL } from "../scripts/api";
import LoadingPage from "../pages/loading/LoadingPage";

export default function AuthProvider({
  children,
}: React.PropsWithChildren<object>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (userUID: string) => {
    await getUserData(userUID);
  };

  const logout = async () => {
    const logoutRequest = await axios.post(
      `${apiURL}/user/logout`,
      {},
      { withCredentials: true }
    );

    if (logoutRequest.status === 200) {
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if we have cookies before attempting to refresh
        const res = await axios.post(
          `${apiURL}/user/refresh-token`,
          {},
          { 
            withCredentials: true,
            // Add a timeout to prevent long-hanging requests
            timeout: 5000
          }
        );

        if (res.status === 200) {
          const data = res.data;
          console.log("Token refreshed successfully");

          // Only try to get user data if we have a userUID
          if (data.userUID) {
            await getUserData(data.userUID);
          } else {
            console.warn("No userUID received from refresh token endpoint");
          }
        }
      } catch (err) {
        console.error("Auto-login failed", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  async function getUserData(userUID: string) {
    console.log("Fetching user data... for UID:", userUID);
    const userData = await fetchUser(userUID);

    if (!(userData instanceof Error)) {
      setUser(userData || null);
    } else {
      console.error("Failed to fetch user:", userData);
      setUser(null);
    }
  }

  if (loading) {
    // Render a fallback while loading
    return <LoadingPage />;
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
