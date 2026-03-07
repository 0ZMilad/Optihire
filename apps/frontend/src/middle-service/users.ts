/**
 * User Service - API calls for user management
 */
import { apiClient } from "./client";
import type { UserCreate, UserRead, UserUpdate } from "./types";

export const userService = {
  /**
   * Create a new user profile
   * This is called after Supabase authentication to create the app profile
   */
  createUser: async (userData: UserCreate): Promise<UserRead> => {
    const response = await apiClient.post<UserRead>("/api/v1/users/", userData);
    return response.data;
  },

  /**
   * Get user profile by ID
   */
  getUserById: async (userId: string): Promise<UserRead> => {
    const response = await apiClient.get<UserRead>(`/api/v1/users/${userId}`);
    return response.data;
  },

  /**
   * Get current user profile (using session token)
   */
  getCurrentUser: async (): Promise<UserRead> => {
    const response = await apiClient.get<UserRead>("/api/v1/users/profile");
    return response.data;
  },

  /**
   * Update user profile
   */
  updateUser: async (
    userId: string,
    userData: UserUpdate
  ): Promise<UserRead> => {
    const response = await apiClient.patch<UserRead>(
      `/api/v1/users/${userId}`,
      userData
    );
    return response.data;
  },

  /**
   * Update the currently authenticated user's profile (no user ID required)
   */
  updateCurrentUserProfile: async (userData: UserUpdate): Promise<UserRead> => {
    const response = await apiClient.put<UserRead>("/api/v1/users/profile", userData);
    return response.data;
  },

  /**
   * Permanently delete the authenticated user's account.
   * Purges all app data, storage files, and the Supabase Auth entry server-side.
   * This is irreversible.
   */
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete("/api/v1/users/account");
  },

  /**
   * Delete user profile
   * This performs a soft delete (sets deleted_at timestamp)
   */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/users/${userId}`);
  },
};
