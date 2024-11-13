import { useContext, createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ReactNode } from "react";

interface AuthContextType {
  userUID: string | null;
  setUserUID: (arg0: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  userUID: null,
  setUserUID: () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userUID, setUserUID] = useState<string | null>(null);
  // const [token, setToken] = useState("");

  useEffect(() => {
    console.log("User UID: ", userUID);
  }, [userUID]);

  return (
    <AuthContext.Provider value={{ userUID, setUserUID }}>
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
