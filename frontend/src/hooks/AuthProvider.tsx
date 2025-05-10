import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "../models/User";
import { fetchUser } from "../services/userService";
import axios from "axios";
import { apiURL } from "../scripts/api";

// TODO: REVIEW THE AUTH PROVIDER TO IMPROVE SECURITY
export default function AuthProvider({
  children,
}: React.PropsWithChildren<object>) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (userUID: string) => {
    console.log("Logging in user...");

    getUserData(userUID);
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

  // Automatically refresh the user token and fetch user data
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
        // This is expected if the user is not logged in, so we don't need to show an error
        console.log("Not currently logged in or refresh token expired");
        // Clear any stale user data
        setUser(null);
      }
    };

    initializeUser();
  }, []);

  async function getUserData(userUID: string) {
    // Fetch user data from the server
    console.log("Fetching user data... for UID:", userUID);
    const userData = await fetchUser(userUID);

    console.log("User data:", userData);
    if (!(userData instanceof Error)) {
      setUser(userData || null);
    } else {
      console.error("Failed to fetch user:", userData);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
