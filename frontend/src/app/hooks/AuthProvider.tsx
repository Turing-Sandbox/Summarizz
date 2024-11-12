import { useContext, createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ReactNode } from "react";

interface User {
  uid: string; // Firebase UID
  firstName: string; // User’s first name
  lastName: string; // User’s last name
  email: string; // User’s email
  username: string; // Display name
  createdAt: Date; // Timestamp
  profileImage?: string; // Optional profile image
  bio?: string; // Optional bio
  phone?: string; // Optional phone number
  location?: string; // Optional location
  website?: string; // Optional website
}

interface AuthContextType {
  token: string;
  user: User | null;
  register: (user: User) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: "",
  user: null,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
  updateUserData: async () => {},
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("LA2token");

      if (storedToken) {
        console.log("Initializing user from localStorage...");
        console.log("Token:", storedToken);
        setToken(storedToken);

        setUser({
          uid: "123",
          firstName: "John",
          lastName: "Doe",
          email: "",
          username: "johndoe",
          createdAt: new Date(),
        });
      }
    };

    initializeAuth();
  }, []);

  const register = async (user: User) => {
    try {
      console.log("Registering user... ", user);
      // 1 - Create User
      // 2 - Login User
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message || "Error creating user");
      } else {
        throw new Error("Error creating user");
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("Logging in user... ", email, password);
      // Login User
      // Check if user logged in successfully
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message || "Error logging in user");
      } else {
        throw new Error("Error logging in user");
      }
    }
  };

  const logout = async () => {
    console.log("Logging out user...");
    try {
      localStorage.removeItem("LA2id");
      localStorage.removeItem("LA2token");
    } catch (error) {
      console.error("Error logging out user:", error);
    }
  };

  const updateUserData = async (user: User) => {
    try {
      console.log("Updating user data... ", user);
      // Update user data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Error updating the user");
      } else {
        throw new Error("Error updating the user");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, user, register, login, logout, updateUserData }}
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
