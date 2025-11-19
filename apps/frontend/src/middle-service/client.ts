/**
 * API Client - Axios instance with interceptors
 */
import axios, { type AxiosError } from "axios";
import { supabase } from "./supabase";

// Get API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance with defaults
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
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
      // Unauthorized - redirect to login
      console.error("Unauthorized request:", error);
      // TODO: Redirect to login page or refresh token
      // window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      // Forbidden
      console.error("Forbidden request:", error);
    }

    if (error.response?.status === 404) {
      // Not found
      console.error("Resource not found:", error);
    }

    if (error.response?.status && error.response.status >= 500) {
      // Server error
      console.error("Server error:", error);
    }

    // Network error
    if (!error.response) {
      console.error("Network error:", error);
    }

    return Promise.reject(error);
  }
);
