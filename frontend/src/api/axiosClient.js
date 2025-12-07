// src/api/axiosClient.js
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1",
  headers: {
    Accept: "application/json",
  },
  timeout: 15000,
});

// Default tenant header (can be changed by TenantContext)
client.defaults.headers["X-Tenant"] = "tenant_a";

export default client;
