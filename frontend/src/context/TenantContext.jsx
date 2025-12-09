// src/context/TenantContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { setTenantBaseURL } from "../api/axiosClient";

export const TenantContext = createContext();

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantChangeCount, setTenantChangeCount] = useState(0);

  /**
   * Switch to a different tenant.
   * Updates axios client base URL to use new tenant domain.
   * Persists selection in localStorage.
   * Note: Currently only used during login. Not exposed in navbar post-login.
   */
  const switchTenant = (t) => {
    setTenant(t);
    // Update axios client to use new tenant domain
    setTenantBaseURL(t.domain);
    // Persist selection for app reload
    localStorage.setItem("selectedTenant", JSON.stringify(t));
    // Increment to trigger re-fetches in components
    setTenantChangeCount((prev) => prev + 1);
  };

  /**
   * Fetch available tenants from backend and initialize tenant selection.
   * Runs once on app mount to fetch real tenant data from database.
   */
  useEffect(() => {
    const initializeTenant = async () => {
      try {
        setIsLoading(true);

        // Fetch all tenants from backend
        const response = await axios.get("http://localhost:8000/api/v1/tenants", {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        const fetchedTenants = response.data.data || [];
        setTenants(fetchedTenants);

        // Try to restore previously selected tenant from localStorage
        const savedTenant = localStorage.getItem("selectedTenant");
        let tenantToLoad = null;

        if (savedTenant) {
          try {
            const saved = JSON.parse(savedTenant);
            // Verify the saved tenant still exists in fetched tenants
            tenantToLoad = fetchedTenants.find((t) => t.id === saved.id);
            if (!tenantToLoad) {
              console.warn(`Saved tenant "${saved.id}" not found in available tenants`);
            }
          } catch (error) {
            console.error("Failed to parse saved tenant:", error);
          }
        }

        // Fallback to first tenant if no saved tenant or saved tenant not found
        if (!tenantToLoad && fetchedTenants.length > 0) {
          tenantToLoad = fetchedTenants[0];
        }

        // Set tenant and initialize axios baseURL
        if (tenantToLoad) {
          setTenant(tenantToLoad);
          setTenantBaseURL(tenantToLoad.domain);
          localStorage.setItem("selectedTenant", JSON.stringify(tenantToLoad));
        }
      } catch (error) {
        console.error("Failed to initialize tenant:", error);
        // If API fails, we'll have empty tenants list and null tenant
        // Login page should handle this gracefully
      } finally {
        setIsLoading(false);
      }
    };

    initializeTenant();
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        switchTenant,
        tenants,
        isLoading,
        tenantChangeCount,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
