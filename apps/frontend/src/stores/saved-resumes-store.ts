import { create } from 'zustand';
import { useState, useEffect, useRef } from 'react';
import { getUserResumes, deleteResume as deleteResumeAPI, duplicateResume as duplicateResumeAPI, deleteAllResumes as deleteAllResumesAPI } from '../middle-service/resumes';
import type { ResumeListItem, ResumeRead } from '../middle-service/types';

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
  deleteAllResumes: () => Promise<void>;
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

  deleteAllResumes: async () => {
    try {
      // Call the backend API to delete all resumes
      await deleteAllResumesAPI();
      
      // Clear local state
      set({ resumes: [] });
    } catch (error: any) {
      console.error('Failed to delete all resumes:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete all resumes');
    }
  },

  duplicateResume: async (id: string) => {
    try {
      // Call the backend API to duplicate the resume
      const duplicatedResume = await duplicateResumeAPI(id);
      
      // Convert ResumeRead to ResumeListItem format for the store
      const listItem: ResumeListItem = {
        id: duplicatedResume.id,
        user_id: duplicatedResume.user_id,
        version_name: duplicatedResume.version_name,
        template_id: duplicatedResume.template_id,
        is_primary: duplicatedResume.is_primary,
        full_name: duplicatedResume.full_name,
        email: duplicatedResume.email,
        phone: duplicatedResume.phone,
        location: duplicatedResume.location,
        professional_summary: duplicatedResume.professional_summary,
        processing_status: duplicatedResume.processing_status,
        created_at: duplicatedResume.created_at,
        updated_at: duplicatedResume.updated_at,
      };
      
      // Add the new resume to local state
      set((state) => ({
        resumes: [listItem, ...state.resumes]
      }));
      
      return listItem;
    } catch (error: any) {
      console.error('Failed to duplicate resume:', error);
      throw new Error(error.response?.data?.detail || 'Failed to duplicate resume');
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
