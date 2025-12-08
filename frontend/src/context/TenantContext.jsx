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
   */
  useEffect(() => {
    const savedTenant = localStorage.getItem("selectedTenant");
    if (savedTenant) {
      try {
        const t = JSON.parse(savedTenant);
        const tenantExists = defaultTenants.find((tn) => tn.id === t.id);
        if (tenantExists) {
          setTenant(t);
          setTenantBaseURL(t.domain);
        }
      } catch (error) {
        console.error("Failed to load saved tenant:", error);
        // Fall back to default
        setTenantBaseURL(defaultTenants[0].domain);
      }
    } else {
      // Initialize with default tenant
      setTenantBaseURL(defaultTenants[0].domain);
    }
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
