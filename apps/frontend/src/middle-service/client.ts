/**
 * API Client - Axios instance with interceptors
 */
import axios, { type AxiosError } from "axios";
import { supabase } from "./supabase";
import { logger } from "@/lib/logger";

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    // Handle common errors
    if (error.response?.status === 401) {
      logger.error("Unauthorized request", { status: 401 });
    }

    if (error.response?.status === 403) {
      logger.error("Forbidden request", { status: 403 });
    }

    if (error.response?.status === 404) {
      logger.error("Resource not found", { status: 404 });
    }

    if (error.response?.status && error.response.status >= 500) {
      logger.error("Server error", { status: error.response.status });
    }

    if (!error.response) {
      logger.error("Network error", { message: error.message });
    }

    return Promise.reject(error);
  }
);
