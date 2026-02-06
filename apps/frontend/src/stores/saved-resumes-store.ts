import { create } from 'zustand';
import { useState, useEffect, useRef } from 'react';
import { getUserResumes, deleteResume as deleteResumeAPI } from '../middle-service/resumes';
import type { ResumeListItem } from '../middle-service/types';

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
  duplicateResume: (id: string) => Promise<void>;
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
    } catch (error: any) {
      console.error('Failed to fetch resumes:', error);
      set({ 
        error: error.message || 'Failed to load resumes', 
        isLoading: false 
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
        resumes: state.resumes.filter(r => r.id !== id)
      }));
    } catch (error: any) {
      console.error('Failed to delete resume:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete resume');
    }
  },

  duplicateResume: async (id: string) => {
    try {
      // TODO: Add API call for duplicate when backend endpoint is ready
      console.log('Duplicate resume:', id);
      // For now, just refresh to get updated list
      await get().refreshResumes();
    } catch (error) {
      console.error('Failed to duplicate resume:', error);
    }
  },

  addNewResume: (resume: ResumeListItem) => {
    set((state) => ({
      resumes: [resume, ...state.resumes]
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
  const { resumes, isLoading, error, fetchResumes } = useSavedResumesStore();
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
