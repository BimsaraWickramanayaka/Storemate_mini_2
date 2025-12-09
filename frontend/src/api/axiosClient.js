// src/api/axiosClient.js
import axios from "axios";

// Create a client object that holds the actual axios instance
// This way, when we update the instance, all modules using this object get the update
const clientWrapper = {
  instance: axios.create({
    baseURL: "http://acme.localhost:8000/api/v1",
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
  const baseURL = `http://${domain}:8000/api/v1`;
  clientWrapper.instance = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
    },
    timeout: 15000,
  });

  // Re-setup interceptors on new instance
  setupInterceptors();
};

/**
 * Set authorization token in axios headers
 * Called by AuthContext when user logs in
 *
 * @param {string|null} token - Bearer token or null to clear
 */
export const setAuthToken = (token) => {
  if (token) {
    clientWrapper.instance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  } else {
    delete clientWrapper.instance.defaults.headers.common["Authorization"];
  }
};

/**
 * Setup request/response interceptors
 * Handles token attachment and error responses
 */
const setupInterceptors = () => {
  const instance = clientWrapper.instance;

  // Clear existing interceptors to avoid duplicates
  instance.interceptors.request.handlers = [];
  instance.interceptors.response.handlers = [];

  // Request interceptor: Attach token if present
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 401 errors and timeouts
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 - Token invalid or expired
      if (error.response?.status === 401 && localStorage.getItem("authToken")) {
        // Clear auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        delete instance.defaults.headers.common["Authorization"];

        // Redirect to login only if we're not already on the login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      // Handle timeout errors (ECONNABORTED, ETIMEDOUT)
      if (error.code === "ECONNABORTED" || error.message === "timeout of 15000ms exceeded") {
        console.warn("Request timeout:", error.config.url);
        // Return error - let components handle retry logic
      }

      return Promise.reject(error);
    }
  );
};

// Setup interceptors on initial load
setupInterceptors();

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
