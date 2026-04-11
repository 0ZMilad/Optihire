import { useEffect, useRef } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { UserRead, UserUpdate } from "@/middle-service/types";
import { userService } from "@/middle-service/users";

// ============================================================================
// State & Actions
// ============================================================================

interface UserProfileState {
  profile: UserRead | null;
  isLoading: boolean;
  error: string | null;
  /** null means never fetched; set to timestamp after first successful fetch */
  lastFetchedAt: number | null;
}

interface UserProfileActions {
  /** Fetch once — skips if already loaded */
  fetchProfile: () => Promise<void>;
  /** Force a fresh fetch from the server */
  refreshProfile: () => Promise<void>;
  /** Optimistically update local state after a successful PUT */
  setProfile: (profile: UserRead) => void;
  /** Clear everything on sign-out */
  clearProfile: () => void;
}

type UserProfileStore = UserProfileState & UserProfileActions;

// ============================================================================
// Store
// ============================================================================

export const useUserProfileStore = create<UserProfileStore>()((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchProfile: async () => {
    // Skip if already loaded or a fetch is in-flight
    const { lastFetchedAt, isLoading } = get();
    if (isLoading) return;
    if (lastFetchedAt !== null) return; // Already fetched once

    set({ isLoading: true, error: null });
    try {
      const profile = await userService.getCurrentUser();
      set({ profile, isLoading: false, lastFetchedAt: Date.now() });
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      // 404 = profile not bootstrapped yet — not an error state
      if (status === 404) {
        set({ profile: null, isLoading: false, lastFetchedAt: Date.now() });
      } else {
        const message =
          (error as { message?: string })?.message ?? "Failed to load profile";
        set({ error: message, isLoading: false });
      }
    }
  },

  refreshProfile: async () => {
    set({ lastFetchedAt: null });
    await get().fetchProfile();
  },

  setProfile: (profile: UserRead) => {
    set({ profile, lastFetchedAt: Date.now() });
  },

  clearProfile: () => {
    set({ profile: null, isLoading: false, error: null, lastFetchedAt: null });
  },
}));

// ============================================================================
// Hook
// ============================================================================

export const useUserProfile = () => {
  const { profile, isLoading, error, fetchProfile, clearProfile } =
    useUserProfileStore(
      useShallow((state) => ({
        profile: state.profile,
        isLoading: state.isLoading,
        error: state.error,
        fetchProfile: state.fetchProfile,
        clearProfile: state.clearProfile,
      }))
    );

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchProfile();
    }
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    clearProfile,
    refresh: useUserProfileStore.getState().refreshProfile,
    setProfile: useUserProfileStore.getState().setProfile,
  };
};

// Convenience updater — call after a successful PUT to keep store in sync
export type { UserRead, UserUpdate };
