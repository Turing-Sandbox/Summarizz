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

  const logout = () => {
    setUser(null);
  };

  // Automatically refresh the user token and fetch user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const res = await axios.post(
          `${apiURL}/user/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (res.status === 200) {
          const data = res.data;
          console.log("User data:", data);

          await getUserData(data.userUID);
        }
      } catch (err) {
        console.error("Auto-login failed", err);
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
