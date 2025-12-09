import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Hook to use AuthContext
 * Usage: const { user, token, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
