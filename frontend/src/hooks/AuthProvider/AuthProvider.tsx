import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "../../models/User";
import LoadingPage from "../../pages/loading/LoadingPage";
import UserService from "../../services/UserService";
import { AuthenticationService } from "../../services/AuthenticationService";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ToastProvider/useToast";

export default function AuthProvider({
  children,
}: React.PropsWithChildren<object>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const login = async (userUID: string) => {
    await getUserData(userUID);
  };

  const logout = async () => {
    const result = await AuthenticationService.logout();
    if (result instanceof Error) {
      toast("An error occurred while logging out. Please try again.", "error");
      return;
    }

    setUser(null);
    navigate("/authentication/login");
  };

  useEffect(() => {
    const initializeUser = async () => {
      // Check if we have cookies before attempting to refresh
      const response = await AuthenticationService.refreshToken();

      if (response instanceof Error) {
        toast("An error occurred while refreshing the token.", "error");
        setUser(null);
        setLoading(false);
        return;
      }

      // Only try to get user data if we have a userUID
      if (response.userUID) {
        await getUserData(response.userUID);
      }

      setLoading(false);
    };

    initializeUser();
  }, []);

  async function getUserData(userUID: string) {
    const userData = await UserService.fetchUserWithID(userUID);

    if (!(userData instanceof Error)) {
      if (userData === null) {
        toast("User not found. Please log in again.", "error");
        setUser(null);
        navigate("/authentication/login");
        return;
      }
      setUser(userData || null);
    } else {
      setUser(null);
    }
  }

  if (loading) {
    // Render a fallback while loading
    return <LoadingPage />;
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
