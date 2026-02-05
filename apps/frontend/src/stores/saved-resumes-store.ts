import { create } from 'zustand';
import { useState, useEffect } from 'react';
import { getUserResumes } from '../middle-service/resumes';
import type { ResumeRead } from '../middle-service/types';

// ============================================================================
// Types - Simplified to match backend exactly  
// ============================================================================

interface SavedResumesState {
  resumes: ResumeRead[];
  isLoading: boolean;
  error: string | null;
}

interface SavedResumesActions {
  fetchResumes: () => Promise<void>;
  refreshResumes: () => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
  addNewResume: (resume: ResumeRead) => void;
  getResume: (id: string) => ResumeRead | undefined;
}

type SavedResumesStore = SavedResumesState & SavedResumesActions;

// ============================================================================
// Store - Pure API approach, no localStorage
// ============================================================================

export const useSavedResumesStore = create<SavedResumesStore>()((set, get) => ({
  resumes: [],
  isLoading: false,
  error: null,

  fetchResumes: async () => {
    set({ isLoading: true, error: null });
    try {
      const resumes = await getUserResumes();
      set({ resumes, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch resumes:', error);
      set({ 
        error: error.message || 'Failed to load resumes', 
        isLoading: false 
      });
    }
  },

  refreshResumes: async () => {
    const { fetchResumes } = get();
    await fetchResumes();
  },

  deleteResume: async (id: string) => {
    try {
      // TODO: Add API call for delete when backend endpoint is ready
      // await deleteResumeAPI(id);
      
      // Optimistically remove from local state
      set((state) => ({
        resumes: state.resumes.filter(r => r.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete resume:', error);
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

  addNewResume: (resume: ResumeRead) => {
    set((state) => ({
      resumes: [resume, ...state.resumes]
    }));
  },

  getResume: (id: string) => {
    return get().resumes.find((resume) => resume.id === id);
  },
}));

// ============================================================================
// Simplified Hook - Always fetches from API
// ============================================================================

export const useSavedResumes = () => {
  const { resumes, isLoading, error, fetchResumes } = useSavedResumesStore();
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
    // Always fetch on mount
    fetchResumes();
  }, [fetchResumes]);
  
  return { 
    resumes: hydrated ? resumes : [], 
    isLoading: hydrated ? isLoading : true,
    error: hydrated ? error : null,
    refresh: fetchResumes,
  };
};

// Export for backward compatibility
export type SavedResume = ResumeRead;
