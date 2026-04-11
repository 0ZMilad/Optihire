import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { getErrorMessage } from "@/lib/error-utils";
import { mapResumeReadToListItem } from "@/lib/resume-mappers";
import {
  deleteResume as deleteResumeAPI,
  duplicateResume as duplicateResumeAPI,
  getUserResumes,
} from "../middle-service/resumes";
import type { ResumeListItem } from "../middle-service/types";

// ============================================================================
// Types - Using lightweight ResumeListItem for list views
// ============================================================================

interface SavedResumesState {
  resumes: ResumeListItem[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

interface SavedResumesActions {
  fetchResumes: () => Promise<void>;
  refreshResumes: () => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<ResumeListItem>;
  addNewResume: (resume: ResumeListItem) => void;
  getResume: (id: string) => ResumeListItem | undefined;
}

type SavedResumesStore = SavedResumesState & SavedResumesActions;

// Stale time: 30 seconds — avoid re-fetching on every page navigation
const STALE_TIME_MS = 30_000;

// ============================================================================
// Store - Pure API approach, no localStorage
// ============================================================================

export const useSavedResumesStore = create<SavedResumesStore>()((set, get) => ({
  resumes: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  fetchResumes: async () => {
    // Skip if data is still fresh (stale-while-revalidate)
    const { lastFetchedAt, isLoading } = get();
    if (isLoading) return; // Deduplicate concurrent calls
    if (lastFetchedAt && Date.now() - lastFetchedAt < STALE_TIME_MS) return;

    set({ isLoading: true, error: null });
    try {
      const resumes = await getUserResumes();
      set({ resumes, isLoading: false, lastFetchedAt: Date.now() });
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      set({
        error: getErrorMessage(error, "Failed to load resumes"),
        isLoading: false,
      });
    }
  },

  refreshResumes: async () => {
    // Force refresh — bypass stale check
    set({ lastFetchedAt: null });
    await get().fetchResumes();
  },

  deleteResume: async (id: string) => {
    try {
      // Call the backend API to delete the resume
      await deleteResumeAPI(id);

      // Remove from local state after successful deletion
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete resume:", error);
      throw new Error(getErrorMessage(error, "Failed to delete resume"));
    }
  },

  duplicateResume: async (id: string) => {
    try {
      // Call the backend API to duplicate the resume
      const duplicatedResume = await duplicateResumeAPI(id);
      const listItem = mapResumeReadToListItem(duplicatedResume);

      // Add the new resume to local state
      set((state) => ({
        resumes: [listItem, ...state.resumes],
      }));

      return listItem;
    } catch (error) {
      console.error("Failed to duplicate resume:", error);
      throw new Error(getErrorMessage(error, "Failed to duplicate resume"));
    }
  },

  addNewResume: (resume: ResumeListItem) => {
    set((state) => ({
      resumes: [resume, ...state.resumes],
    }));
  },

  getResume: (id: string) => {
    return get().resumes.find((resume) => resume.id === id);
  },
}));

// ============================================================================
// Simplified Hook - Fetches from API with stale-while-revalidate
// ============================================================================

export const useSavedResumes = () => {
  // Use useShallow to only re-render when these specific fields change,
  // not on any store mutation (e.g. optimistic list updates)
  const { resumes, isLoading, error, fetchResumes } = useSavedResumesStore(
    useShallow((state) => ({
      resumes: state.resumes,
      isLoading: state.isLoading,
      error: state.error,
      fetchResumes: state.fetchResumes,
    }))
  );
  const [hydrated, setHydrated] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchResumes();
    }
  }, [fetchResumes]);

  return {
    resumes: hydrated ? resumes : [],
    isLoading: hydrated ? isLoading : true,
    error: hydrated ? error : null,
    refresh: useSavedResumesStore.getState().refreshResumes,
  };
};

// Export for backward compatibility
export type SavedResume = ResumeListItem;
