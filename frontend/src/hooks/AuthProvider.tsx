import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "../models/User";
import LoadingPage from "../pages/loading/LoadingPage";
import UserService from "../services/UserService";
import { AuthenticationService } from "../services/AuthenticationService";
import { useNavigate } from "react-router-dom";
import ToastNotification from "../components/ToastNotification";

export default function AuthProvider({
  children,
}: React.PropsWithChildren<object>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "feedback" | "success";
  } | null>(null);

  const login = async (userUID: string) => {
    await getUserData(userUID);
  };

  const logout = async () => {
    setToast(null);

    const result = await AuthenticationService.logout();
    if (result instanceof Error) {
      setToast({
        message:
          result.message || "An error to logout occurred. Please try again.",
        type: "error",
      });
      return;
    }

    setUser(null);
    navigate("/authentication/login");
  };

  useEffect(() => {
    const initializeUser = async () => {
      setToast(null);

      // Check if we have cookies before attempting to refresh
      const response = await AuthenticationService.refreshToken();

      if (response instanceof Error) {
        setToast({
          message:
            response.message ||
            "An error occurred while refreshing the token. Please try again.",
          type: "error",
        });
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
    setToast(null);
    const userData = await UserService.fetchUserWithID(userUID);

    if (!(userData instanceof Error)) {
      if (userData === null) {
        setToast({
          message: "Issue to login. User not found.",
          type: "error",
        });
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
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
}
