// src/api/axiosClient.js
import axios from "axios";

// Create a client object that holds the actual axios instance
// This way, when we update the instance, all modules using this object get the update
const clientWrapper = {
  instance: axios.create({
    baseURL: "http://acme.localhost:8000/v1",
    headers: {
      Accept: "application/json",
    },
    timeout: 15000,
  }),
};

/**
 * Dynamically update axios client base URL when switching tenants.
 * Called by TenantContext when tenant changes.
 *
 * @param {string} domain - Tenant domain (e.g., "acme.localhost", "globex.localhost")
 */
export const setTenantBaseURL = (domain) => {
  const baseURL = `http://${domain}:8000/v1`;
  clientWrapper.instance = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
    },
    timeout: 15000,
  });
};

// Export a proxy that always uses the current instance
export default new Proxy(clientWrapper, {
  get(target, prop) {
    if (prop === "instance") {
      return target.instance;
    }
    // Forward all axios methods to the current instance
    return target.instance[prop];
  },
});
