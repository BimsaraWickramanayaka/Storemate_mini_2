import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * If user is not authenticated, redirects to login page
 *
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
}
