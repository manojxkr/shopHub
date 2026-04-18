import axios from "axios";

/**
 * Resolve API base URL for different environments
 * - Development: Uses Vite proxy (relative /api path) → proxied to http://localhost:8080
 * - Production: Uses /api (relative path) → served from same origin
 * - Override: Set VITE_API_BASE_URL environment variable for custom URL
 */
function resolveApiBaseURL() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv;
  
  // Use relative path to leverage Vite proxy in dev and same-origin in production
  // This avoids CORS issues and works seamlessly across environments
  return "/api";
}

const baseURL = resolveApiBaseURL();

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      const path = window.location.pathname || "";
      if (!path.startsWith("/login") && !path.startsWith("/register")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);
