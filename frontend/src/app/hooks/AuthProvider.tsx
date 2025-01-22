"use client";

import { useContext, createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebaseClientConfig";

interface AuthContextType {
  userUID: string | null;
  token: string | null;
  user: User | null;
  loading: boolean; // New loading state

  setToken: (token: string) => void;
  getToken: () => string | null;

  login: (token: string, userUID: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userUID: null,
  token: null,
  user: null,
  loading: true, // Default loading state
  setToken: () => {},
  getToken: () => null,
  login: () => {},
  logout: () => {}
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setTokenState(storedToken);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        localStorage.setItem("userUID", user.uid);
      } else {
        localStorage.removeItem("userUID");
      }
      setLoading(false); // Auth state loaded, set loading to false
    });

    return () => unsubscribe();
  }, []);

  function setToken(token: string) {
    setTokenState(token);
    localStorage.setItem("token", token);
  }

  function getToken() {
    return token;
  }

  function login(token: string, userUID: string) {
    setToken(token);
    localStorage.setItem("userUID", userUID);
  }

  function logout() {
    auth.signOut().then(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("userUID");
      setTokenState(null);
      router.push("/authentication/login");
    });
  }

  return (
    <AuthContext.Provider
      value={{
        userUID: firebaseUser ? firebaseUser.uid : null,
        token,
        user: firebaseUser,
        loading,
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

export const useAuth = () => useContext(AuthContext);
