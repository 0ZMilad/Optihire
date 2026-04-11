/**
 * User Service - API calls for user management
 */
import { apiClient } from "./client";
import type { UserRead, UserUpdate } from "./types";

export const userService = {
  /**
   * Get current user profile (using session token)
   */
  getCurrentUser: async (): Promise<UserRead> => {
    const response = await apiClient.get<UserRead>("/api/v1/users/profile");
    return response.data;
  },

  /**
   * Update the currently authenticated user's profile (no user ID required)
   */
  updateCurrentUserProfile: async (userData: UserUpdate): Promise<UserRead> => {
    const response = await apiClient.put<UserRead>(
      "/api/v1/users/profile",
      userData
    );
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
};
