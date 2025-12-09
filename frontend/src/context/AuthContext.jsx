import React, { createContext, useState, useCallback, useEffect, useContext } from "react";
import { TenantContext } from "./TenantContext";
import axiosClient, { setAuthToken } from "../api/axiosClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const tenantContext = useContext(TenantContext);
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Login handler
   * Calls /api/v1/login endpoint with email and password
   * Stores token and user in state and localStorage
   */
  const login = useCallback(
    async (email, password) => {
      if (!tenantContext?.tenant?.domain) {
        throw new Error("Tenant not selected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosClient.post("/login", {
          email,
          password,
        });

        const { token: newToken, user: userData } = response.data;

        setToken(newToken);
        setUser(userData);

        // Store in localStorage for persistence
        localStorage.setItem("authToken", newToken);
        localStorage.setItem("authUser", JSON.stringify(userData));

        // Set token for all subsequent requests
        setAuthToken(newToken);

        return { success: true, user: userData };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [tenantContext?.tenant?.domain]
  );

  /**
   * Logout handler
   * Calls /api/v1/logout endpoint to revoke token on backend
   * Clears local state and localStorage
   */
  const logout = useCallback(async () => {
    try {
      if (token) {
        await axiosClient.post("/logout");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear state regardless of API call success
      setToken(null);
      setUser(null);
      setError(null);

      // Clear localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");

      // Clear auth header from axios
      setAuthToken(null);
    }
  }, [token]);

  /**
   * Restore session on app load
   * Checks localStorage for saved token and user
   * Restores immediately without validation to avoid race conditions
   * Validation happens on first API request (interceptor will catch 401)
   */
  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken && storedUser) {
          // Set token immediately so axios can use it
          setAuthToken(storedToken);
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Session restore error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Restore synchronously - no delay needed
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
