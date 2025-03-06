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
    localStorage.setItem("userUID", userUID);
  }

  function getUserUID() {
    return localStorage.getItem("userUID");
  }

  function setToken(token: string) {
    localStorage.setItem("token", token);
  }

  function getToken() {
    return localStorage.getItem("token");
  }

  function login(token: string, userUID: string) {
    setToken(token);
    setUserUID(userUID);
  }

  function logout() {
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
