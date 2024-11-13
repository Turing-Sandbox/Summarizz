import { useContext, createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  userUID: string | null;
  setUserUID: (arg0: string | null) => void;
  token: string | null;
  setToken: (arg0: string) => void;

  login: (token: string, userUID: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userUID: null,
  setUserUID: () => {},
  token: null,
  setToken: () => {},

  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userUID, setUserUID] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUserUID(localStorage.getItem("userUID"));
  }, []);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUserUID(localStorage.getItem("userUID"));

    console.log("Token: ", token);
    console.log("UserUID: ", userUID);
  }, [userUID, token]);

  function login(token: string, userUID: string) {
    setToken(token);
    setUserUID(userUID);

    // Save token to local storage
    localStorage.setItem("token", token);
    localStorage.setItem("userUID", userUID);
  }

  function logout() {
    setUserUID(null);
    setToken(null);

    // Remove token from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("userUID");
  }

  return (
    <AuthContext.Provider
      value={{ userUID, setUserUID, token, setToken, login, logout }}
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
