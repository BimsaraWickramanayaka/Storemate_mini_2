import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TenantContext } from "../context/TenantContext";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { switchTenant, tenants } = useContext(TenantContext);
  const { login, isLoading, error: authError } = useAuth();

  const [selectedTenant, setSelectedTenant] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [availableTenants, setAvailableTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  /**
   * Fetch available tenants from backend
   * GET /api/v1/tenants (public endpoint)
   * Uses direct axios instance to access central server
   */
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoadingTenants(true);
        // Create a fresh axios instance for the public endpoint
        // Point directly to localhost:8000 to access central server (not tenant-specific)
        const response = await axios.get("http://localhost:8000/api/v1/tenants", {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });
        setAvailableTenants(response.data.data || []);

        // Set first tenant as default
        if (response.data.data && response.data.data.length > 0) {
          setSelectedTenant(response.data.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
        // Fallback to static tenants from context
        setAvailableTenants(tenants);
        if (tenants.length > 0) {
          setSelectedTenant(tenants[0].id);
        }
      } finally {
        setLoadingTenants(false);
      }
    };

    fetchTenants();
  }, [tenants]);

  /**
   * Handle login form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!selectedTenant) {
      setError("Please select a tenant");
      return;
    }
    if (!email) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      // Switch to selected tenant first
      const tenant = availableTenants.find((t) => t.id === selectedTenant);
      if (tenant) {
        switchTenant(tenant);
        // Give a tick for the tenant switch to propagate
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Attempt login
      await login(email, password);

      // Redirect to dashboard on success
      navigate("/");
    } catch (err) {
      // Error already set in AuthContext, just handle UI
      setError(authError || "Login failed. Please try again.");
    }
  };

  if (loadingTenants) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading tenants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Storemate</h1>
          <p className="text-gray-600 text-sm mt-2">Order Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Tenant Selector */}
          <div>
            <label htmlFor="tenant" className="block text-sm font-medium text-gray-700 mb-1">
              Organization
            </label>
            <select
              id="tenant"
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              disabled={isLoading}
            >
              <option value="">Select an organization</option>
              {availableTenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tenant.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>
              <span className="font-medium">Admin:</span> admin@tenant.com
            </li>
            <li>
              <span className="font-medium">Staff:</span> staff@tenant.com
            </li>
            <li>
              <span className="font-medium">Password:</span> password123
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
