// src/context/TenantContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { setTenantBaseURL } from "../api/axiosClient";

export const TenantContext = createContext();

/**
 * Map of actual tenants from your backend.
 * Domain-based tenant identification (replaces header-based approach).
 */
const defaultTenants = [
  { id: "acme", domain: "acme.localhost", name: "ACME Corp" },
  { id: "globex", domain: "globex.localhost", name: "Globex Inc" },
];

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(defaultTenants[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantChangeCount, setTenantChangeCount] = useState(0); // Trigger for re-fetching

  /**
   * Switch to a different tenant.
   * Updates axios client base URL to use new tenant domain.
   * Persists selection in localStorage.
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
   * Load persisted tenant on component mount.
   * Runs synchronously to set up axios baseURL before AuthContext needs it.
   */
  useEffect(() => {
    // Load saved tenant or use default
    const savedTenant = localStorage.getItem("selectedTenant");
    let tenantToLoad = defaultTenants[0]; // Default fallback

    if (savedTenant) {
      try {
        const t = JSON.parse(savedTenant);
        const tenantExists = defaultTenants.find((tn) => tn.id === t.id);
        if (tenantExists) {
          tenantToLoad = t;
        }
      } catch (error) {
        console.error("Failed to load saved tenant:", error);
        // Fall back to default
      }
    }

    // Set tenant and initialize axios baseURL immediately (synchronously)
    setTenant(tenantToLoad);
    setTenantBaseURL(tenantToLoad.domain);
    setIsLoading(false);
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        switchTenant,
        tenants: defaultTenants,
        isLoading,
        tenantChangeCount,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
