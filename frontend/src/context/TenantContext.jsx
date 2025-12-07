// src/context/TenantContext.jsx
import React, { createContext, useState } from "react";
import axiosClient from "../api/axiosClient";

export const TenantContext = createContext();

const defaultTenants = [
  { id: "tenant_a", name: "Tenant A" },
  { id: "tenant_b", name: "Tenant B" },
];

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(defaultTenants[0]);

  const switchTenant = (t) => {
    setTenant(t);
    axiosClient.defaults.headers["X-Tenant"] = t.id;
    // Optionally persist tenant in localStorage:
    // localStorage.setItem('tenant', t.id)
  };

  return (
    <TenantContext.Provider value={{ tenant, switchTenant, tenants: defaultTenants }}>
      {children}
    </TenantContext.Provider>
  );
}
