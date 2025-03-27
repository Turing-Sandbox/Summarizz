"use client";

import { useContext, createContext, useEffect, useState } from "react";
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
  const [userUID, setUserUIDState] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  // Initialize state from localStorage on client-side only
  useEffect(() => {
    setUserUIDState(localStorage.getItem("userUID"));
    setTokenState(localStorage.getItem("token"));
  }, []);

  function setUserUID(newUserUID: string) {
    localStorage.setItem("userUID", newUserUID);
    setUserUIDState(newUserUID);
  }

  function getUserUID() {
    return userUID;
  }

  function setToken(newToken: string) {
    localStorage.setItem("token", newToken);
    setTokenState(newToken);
  }

  function getToken() {
    return token;
  }

  function login(newToken: string, newUserUID: string) {
    setToken(newToken);
    setUserUID(newUserUID);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userUID");
    setTokenState(null);
    setUserUIDState(null);
    router.push("/authentication/login");
  }

  return (
    <AuthContext.Provider
      value={{
        userUID,
        token,
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
