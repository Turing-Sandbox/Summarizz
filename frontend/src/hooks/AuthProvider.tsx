"use client";

import { useContext, createContext } from "react";
import PropTypes from "prop-types";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
interface AuthContextType {
  userUID: string | null;
  setUserUID: (arg0: string) => void;
  getUserUID: () => string | null;
  token: string | null;
  setToken: (arg0: string) => void;
  getToken: () => string | null;
  login: (token: string, userUID: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType>({
  userUID: null,
  setUserUID: () => {},
  getUserUID: () => null,
  token: null,
  setToken: () => {},
  getToken: () => null,
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  function setUserUID(userUID: string) {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    localStorage.setItem("userUID", userUID);
  }

  function getUserUID() {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return null;

    return localStorage.getItem("userUID");
  }

  function setToken(token: string) {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    localStorage.setItem("token", token);
  }

  function getToken() {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return null;

    return localStorage.getItem("token");
  }

  function login(token: string, userUID: string) {
    setToken(token);
    setUserUID(userUID);
  }

  function logout() {
    // Only proceed if we're in the browser environment
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("userUID");
    router.push("/authentication/login");
  }

  return (
    <AuthContext.Provider
      value={{
        userUID: getUserUID(),
        token: getToken(),
        setUserUID,
        getUserUID,
        setToken,
        getToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
