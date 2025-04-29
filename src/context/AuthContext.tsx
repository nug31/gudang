import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "../types";
import { mockUsers } from "../data/mockData";
import * as api from "../services/api";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    department?: string;
  }) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("AuthContext: Attempting to login with email:", email);

      // Make an API call to the login endpoint
      const response = await fetch("http://localhost/simple_login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("AuthContext: Login response status:", response.status);

      const data = await response.json();
      console.log("AuthContext: Login response data:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Invalid email or password");
      }

      // Set the current user from the API response
      const user: User = {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role as "admin" | "manager" | "requester",
        department: data.data.department || undefined,
      };

      console.log("AuthContext: User logged in successfully:", user);

      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
    } catch (err) {
      console.error("AuthContext: Login error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    department?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      console.log("AuthContext: Attempting to register with data:", data);

      // Make an API call to register the user
      const response = await fetch(
        "http://localhost/simple_user_management.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            role: "requester", // New users are always requesters by default
            department: data.department,
          }),
        }
      );

      console.log("AuthContext: Register response status:", response.status);

      const responseData = await response.json();
      console.log("AuthContext: Register response data:", responseData);

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || "Failed to register");
      }

      // Create user object from response
      const newUser: User = {
        id: responseData.data.id,
        name: responseData.data.name,
        email: responseData.data.email,
        role: responseData.data.role as "admin" | "manager" | "requester",
        department: responseData.data.department || undefined,
      };

      console.log("AuthContext: User registered successfully:", newUser);

      // No longer auto-login after registration
      // User must explicitly log in with their credentials
    } catch (err) {
      console.error("AuthContext: Register error:", err);
      setError(err instanceof Error ? err.message : "Failed to register");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
