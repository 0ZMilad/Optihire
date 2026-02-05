import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect } from 'react';
import type { ResumeBuilderData } from '../components/resume/types';

// ============================================================================
// Types
// ============================================================================

export interface SavedResume {
  id: string;
  name: string;
  data: ResumeBuilderData;
  createdAt: string;
  updatedAt: string;
}

interface SavedResumesState {
  resumes: SavedResume[];
}

interface SavedResumesActions {
  saveResume: (data: ResumeBuilderData, name?: string) => string;
  updateResume: (id: string, data: ResumeBuilderData, name?: string) => void;
  deleteResume: (id: string) => void;
  getResume: (id: string) => SavedResume | undefined;
  duplicateResume: (id: string) => string | null;
}

type SavedResumesStore = SavedResumesState & SavedResumesActions;

// ============================================================================
// Helper Functions
// ============================================================================

const generateId = () => `resume_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const generateDefaultName = (data: ResumeBuilderData) => {
  if (data.versionName) return data.versionName;
  if (data.personal.fullName) return `${data.personal.fullName}'s Resume`;
  return `Resume ${new Date().toLocaleDateString()}`;
};

// ============================================================================
// Store
// ============================================================================

export const useSavedResumesStore = create<SavedResumesStore>()(
  persist(
    (set, get) => ({
      resumes: [],

      saveResume: (data, name) => {
        const id = generateId();
        const now = new Date().toISOString();
        
        const newResume: SavedResume = {
          id,
          name: name || generateDefaultName(data),
          data: { ...data, id },
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          resumes: [newResume, ...state.resumes],
        }));

        return id;
      },

      updateResume: (id, data, name) => {
        set((state) => ({
          resumes: state.resumes.map((resume) =>
            resume.id === id
              ? {
                  ...resume,
                  data: { ...data, id },
                  name: name || resume.name,
                  updatedAt: new Date().toISOString(),
                }
              : resume
          ),
        }));
      },

      deleteResume: (id) => {
        set((state) => ({
          resumes: state.resumes.filter((resume) => resume.id !== id),
        }));
      },

      getResume: (id) => {
        return get().resumes.find((resume) => resume.id === id);
      },

      duplicateResume: (id) => {
        const original = get().getResume(id);
        if (!original) return null;

        const newId = generateId();
        const now = new Date().toISOString();

        const duplicated: SavedResume = {
          id: newId,
          name: `${original.name} (Copy)`,
          data: { ...original.data, id: newId },
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          resumes: [duplicated, ...state.resumes],
        }));

        return newId;
      },
    }),
    {
      name: 'optihire_saved_resumes',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================================
// Selector Hooks
// ============================================================================

// Basic selector (may have hydration issues on initial render)
export const useSavedResumesRaw = () => useSavedResumesStore((state) => state.resumes);

// Hydration-safe hook for use in components
export const useSavedResumes = () => {
  const resumes = useSavedResumesStore((state) => state.resumes);
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  // Return empty array during SSR/initial hydration
  return hydrated ? resumes : [];
};
