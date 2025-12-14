/**
 * API Client - Axios instance with interceptors
 */
import axios, { type AxiosError } from "axios";
import { supabase } from "./supabase";
import { logger } from "@/lib/logger";

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Error throttling: Track recently logged errors to prevent spam
const errorCache = new Map<string, number>();
const ERROR_THROTTLE_MS = 5000; // Only log same error once per 5 seconds

/**
 * Check if an error should be logged based on throttling rules
 */
function shouldLogError(errorKey: string): boolean {
  const now = Date.now();
  const lastLogged = errorCache.get(errorKey);
  
  if (!lastLogged || now - lastLogged > ERROR_THROTTLE_MS) {
    errorCache.set(errorKey, now);
    return true;
  }
  
  return false;
}

// Create axios instance with defaults
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
  withCredentials: true, // Include cookies in requests
});

// Request interceptor - add auth token if needed
apiClient.interceptors.request.use(

    async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors with throttling to prevent spam
    if (error.response?.status === 401) {
      const errorKey = "401-unauthorized";
      if (shouldLogError(errorKey)) {
        logger.error("Unauthorized request", { status: 401 });
      }
    }

    if (error.response?.status === 403) {
      const errorKey = "403-forbidden";
      if (shouldLogError(errorKey)) {
        logger.error("Forbidden request", { status: 403 });
      }
    }

    if (error.response?.status === 404) {
      const errorKey = `404-${error.config?.url || 'unknown'}`;
      if (shouldLogError(errorKey)) {
        logger.error("Resource not found", { status: 404, url: error.config?.url });
      }
    }

    if (error.response?.status && error.response.status >= 500) {
      const errorKey = `${error.response.status}-${error.config?.url || 'unknown'}`;
      if (shouldLogError(errorKey)) {
        logger.error("Server error", { 
          status: error.response.status,
          url: error.config?.url 
        });
      }
    }

    if (!error.response) {
      const errorKey = `network-${error.config?.url || 'unknown'}`;
      if (shouldLogError(errorKey)) {
        logger.error("Network error", { 
          message: error.message,
          url: error.config?.url 
        });
      }
    }

    return Promise.reject(error);
  }
);
