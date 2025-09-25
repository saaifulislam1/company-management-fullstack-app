import { useContext } from "react";
import { AuthContext } from "@/providers/AuthProvider";

/**
 * @hook useAuth
 * @description A custom hook to easily access the authentication context.
 * It provides a clean and reusable way to get user data, token, and auth functions.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
