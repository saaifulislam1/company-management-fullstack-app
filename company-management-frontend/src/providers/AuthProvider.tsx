"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
// Import our new auth services
import { getMyProfile, logout as apiLogout } from "@/services/authService";

// ... (User and AuthContextType interfaces remain the same) ...
interface User {
  id: string;
  email: string;
  role: "EMPLOYEE" | "HR" | "ADMIN" | "MANAGER";
  isManager?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  // logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
// ---

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      const verifyTokenAndFetchUser = async () => {
        try {
          // Now using our clean service function!
          const profileResponse = await getMyProfile();
          // The token is already in localStorage, so we just need to set state
          login(storedToken, profileResponse.data);
        } catch (error) {
          console.error("Session validation failed", error);
          logout();
        } finally {
          setIsLoading(false);
        }
      };
      verifyTokenAndFetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Login function is now simpler. It just sets state.
  // The actual API call will happen in the login page component.
  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("authToken", newToken);
  };

  const logout = async () => {
    try {
      // --- THIS IS THE CHANGE ---
      // Call the backend to invalidate the session in Redis
      await apiLogout();
    } catch (error) {
      console.error("Logout API call failed", error);
    } finally {
      // Always clear local state and storage regardless of API call success
      setToken(null);
      setUser(null);
      localStorage.removeItem("authToken");
      router.push("/login");
    }
  };

  const value = { user, token, isLoading, login, logout };

  // While checking for a session, we can render a loading spinner
  // to prevent a flash of incorrect content (e.g., showing the login page briefly).
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
