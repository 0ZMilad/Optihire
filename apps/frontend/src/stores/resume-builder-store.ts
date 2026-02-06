import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';
import { createResume, saveResume } from '../middle-service/resumes';
import { useSavedResumesStore } from './saved-resumes-store';
import type {
  ResumeBuilderData,
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Project,
  Certification,
  SaveStatus,
  ResumeDraft,
} from '../components/resume/types';
import {
  createEmptyResumeData,
  createEmptyExperience,
  createEmptyEducation,
  createEmptySkill,
  createEmptyProject,
  createEmptyCertification,
} from '../components/resume/types';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  DRAFT: 'optihire_resume_builder_draft',
  SETTINGS: 'optihire_resume_builder_settings',
} as const;

// Current schema version for migration support
const SCHEMA_VERSION = 1;

// ============================================================================
// Store State Interface
// ============================================================================

interface ResumeBuilderState {
  data: ResumeBuilderData;
  isDirty: boolean;
  saveStatus: SaveStatus;
  lastSaved: string | null;
  hasDraft: boolean;
  autoSaveEnabled: boolean;
  autoSaveIntervalMs: number;
  activeSection: string;
  isInitialized: boolean;
}

// ============================================================================
// Store Actions Interface
// ============================================================================

interface ResumeBuilderActions {
  initialize: () => void;
  reset: () => void;
  updatePersonalInfo: <K extends keyof PersonalInfo>(field: K, value: PersonalInfo[K]) => void;
  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, updates: Partial<WorkExperience>) => void;
  removeExperience: (id: string) => void;
  reorderExperiences: (orderedIds: string[]) => void;
  addEducation: () => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (orderedIds: string[]) => void;
  addSkill: () => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  reorderSkills: (orderedIds: string[]) => void;
  addProject: () => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (orderedIds: string[]) => void;
  addCertification: () => void;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  reorderCertifications: (orderedIds: string[]) => void;
  reorderSections: (sectionOrder: string[]) => void;
  setTemplate: (templateId: string | null) => void;
  setVersionName: (name: string) => void;
  setIsPrimary: (isPrimary: boolean) => void;
  saveDraft: () => void;
  saveToBackend: () => Promise<void>;
  loadDraft: () => boolean;
  clearDraft: () => void;
  markAsSaved: () => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setActiveSection: (section: string) => void;
  loadFromData: (data: Partial<ResumeBuilderData>) => void;
}

// ============================================================================
// Combined Store Type
// ============================================================================

export type ResumeBuilderStore = ResumeBuilderState & ResumeBuilderActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: ResumeBuilderState = {
  data: createEmptyResumeData(),
  isDirty: false,
  saveStatus: 'idle',
  lastSaved: null,
  hasDraft: false,
  autoSaveEnabled: true,
  autoSaveIntervalMs: 2000,
  activeSection: 'personal',
  isInitialized: false,
};

// ============================================================================
// Zustand Store
// ============================================================================

export const useResumeBuilderStore = create<ResumeBuilderStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Initialization
      initialize: () => {
        const state = get();
        if (state.isInitialized) return;
        const hasDraft = state.loadDraft();
        set({ isInitialized: true, hasDraft });
      },

      reset: () => {
        set({ ...initialState, isInitialized: true });
      },

      // Personal Info
      updatePersonalInfo: (field, value) => {
        set((state) => ({
          data: {
            ...state.data,
            personal: { ...state.data.personal, [field]: value },
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      setPersonalInfo: (info) => {
        set((state) => ({
          data: {
            ...state.data,
            personal: { ...state.data.personal, ...info },
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      // Summary
      updateSummary: (summary) => {
        set((state) => ({
          data: { ...state.data, summary },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      // Experiences
      addExperience: () => {
        set((state) => {
          const newExperience = createEmptyExperience(state.data.experiences.length);
          return {
            data: {
              ...state.data,
              experiences: [...state.data.experiences, newExperience],
            },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      updateExperience: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            experiences: state.data.experiences.map((exp) =>
              exp.id === id ? { ...exp, ...updates } : exp
            ),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      removeExperience: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            experiences: state.data.experiences
              .filter((exp) => exp.id !== id)
              .map((exp, idx) => ({ ...exp, displayOrder: idx })),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      reorderExperiences: (orderedIds) => {
        set((state) => {
          const experienceMap = new Map(state.data.experiences.map((e) => [e.id, e]));
          const reordered = orderedIds
            .map((id, idx) => {
              const exp = experienceMap.get(id);
              return exp ? { ...exp, displayOrder: idx } : null;
            })
            .filter((e): e is WorkExperience => e !== null);
          return {
            data: { ...state.data, experiences: reordered },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      // Education
      addEducation: () => {
        set((state) => {
          const newEducation = createEmptyEducation(state.data.education.length);
          return {
            data: {
              ...state.data,
              education: [...state.data.education, newEducation],
            },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      updateEducation: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((edu) =>
              edu.id === id ? { ...edu, ...updates } : edu
            ),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      removeEducation: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education
              .filter((edu) => edu.id !== id)
              .map((edu, idx) => ({ ...edu, displayOrder: idx })),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      reorderEducation: (orderedIds) => {
        set((state) => {
          const educationMap = new Map(state.data.education.map((e) => [e.id, e]));
          const reordered = orderedIds
            .map((id, idx) => {
              const edu = educationMap.get(id);
              return edu ? { ...edu, displayOrder: idx } : null;
            })
            .filter((e): e is Education => e !== null);
          return {
            data: { ...state.data, education: reordered },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      // Skills
      addSkill: () => {
        set((state) => {
          const newSkill = createEmptySkill(state.data.skills.length);
          return {
            data: {
              ...state.data,
              skills: [...state.data.skills, newSkill],
            },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      updateSkill: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.map((skill) =>
              skill.id === id ? { ...skill, ...updates } : skill
            ),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      removeSkill: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills
              .filter((skill) => skill.id !== id)
              .map((skill, idx) => ({ ...skill, displayOrder: idx })),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      reorderSkills: (orderedIds) => {
        set((state) => {
          const skillMap = new Map(state.data.skills.map((s) => [s.id, s]));
          const reordered = orderedIds
            .map((id, idx) => {
              const skill = skillMap.get(id);
              return skill ? { ...skill, displayOrder: idx } : null;
            })
            .filter((s): s is Skill => s !== null);
          return {
            data: { ...state.data, skills: reordered },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      // Projects
      addProject: () => {
        set((state) => {
          const newProject = createEmptyProject(state.data.projects.length);
          return {
            data: {
              ...state.data,
              projects: [...state.data.projects, newProject],
            },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      updateProject: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((project) =>
              project.id === id ? { ...project, ...updates } : project
            ),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      removeProject: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects
              .filter((project) => project.id !== id)
              .map((project, idx) => ({ ...project, displayOrder: idx })),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      reorderProjects: (orderedIds) => {
        set((state) => {
          const projectMap = new Map(state.data.projects.map((p) => [p.id, p]));
          const reordered = orderedIds
            .map((id, idx) => {
              const project = projectMap.get(id);
              return project ? { ...project, displayOrder: idx } : null;
            })
            .filter((p): p is Project => p !== null);
          return {
            data: { ...state.data, projects: reordered },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      // Certifications
      addCertification: () => {
        set((state) => {
          const newCert = createEmptyCertification(state.data.certifications.length);
          return {
            data: {
              ...state.data,
              certifications: [...state.data.certifications, newCert],
            },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      updateCertification: (id, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.map((cert) =>
              cert.id === id ? { ...cert, ...updates } : cert
            ),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      removeCertification: (id) => {
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications
              .filter((cert) => cert.id !== id)
              .map((cert, idx) => ({ ...cert, displayOrder: idx })),
          },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      reorderCertifications: (orderedIds) => {
        set((state) => {
          const certMap = new Map(state.data.certifications.map((c) => [c.id, c]));
          const reordered = orderedIds
            .map((id, idx) => {
              const cert = certMap.get(id);
              return cert ? { ...cert, displayOrder: idx } : null;
            })
            .filter((c): c is Certification => c !== null);
          return {
            data: { ...state.data, certifications: reordered },
            isDirty: true,
            saveStatus: 'idle',
          };
        });
      },

      // Section Ordering
      reorderSections: (sectionOrder) => {
        set((state) => ({
          data: { ...state.data, sectionOrder },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      // Template Management
      setTemplate: (templateId) => {
        set((state) => ({
          data: { ...state.data, templateId },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      // Version Management
      setVersionName: (name) => {
        set((state) => ({
          data: { ...state.data, versionName: name },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      setIsPrimary: (isPrimary) => {
        set((state) => ({
          data: { ...state.data, isPrimary },
          isDirty: true,
          saveStatus: 'idle',
        }));
      },

      // Draft Management
      saveDraft: () => {
        const state = get();
        set({ saveStatus: 'saving' });

        try {
          const draftData: ResumeDraft = {
            data: state.data,
            metadata: {
              lastSaved: new Date().toISOString(),
              version: SCHEMA_VERSION,
              isAutoSave: state.autoSaveEnabled,
            },
          };
          localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draftData));
          set({
            isDirty: false,
            saveStatus: 'saved',
            lastSaved: draftData.metadata.lastSaved,
            hasDraft: true,
          });
        } catch (error) {
          console.error('Failed to save draft:', error);
          set({ saveStatus: 'error' });
        }
      },

      // Save to Backend
      saveToBackend: async () => {
        const state = get();
        
        // Validation: Check required fields
        if (!state.data.versionName?.trim()) {
          toast.error('Please enter a version name for your resume');
          return;
        }

        if (!state.data.personal.fullName?.trim()) {
          toast.error('Please enter your full name');
          return;
        }

        set({ saveStatus: 'saving' });

        try {
          const savedResume = await saveResume(state.data);
          
          // Update the local data with the resume ID (for new resumes) or keep existing ID
          set((prevState) => ({
            data: {
              ...prevState.data,
              id: savedResume.id,
            },
            isDirty: false,
            saveStatus: 'saved',
            lastSaved: new Date().toISOString(),
          }));

          // Handle different actions based on whether this was create or update
          if (!state.data.id) {
            // This was a new resume creation - add to saved resumes store
            const savedResumesStore = useSavedResumesStore.getState();
            savedResumesStore.addNewResume({
              id: savedResume.id,
              user_id: savedResume.user_id,
              version_name: savedResume.version_name,
              template_id: savedResume.template_id,
              is_primary: savedResume.is_primary,
              full_name: savedResume.full_name,
              email: savedResume.email,
              phone: savedResume.phone,
              location: savedResume.location,
              professional_summary: savedResume.professional_summary,
              processing_status: savedResume.processing_status,
              created_at: savedResume.created_at,
              updated_at: savedResume.updated_at,
            });
            toast.success(`Resume "${state.data.versionName}" created successfully!`);
          } else {
            // This was an update - refresh the saved resumes list to reflect changes
            const savedResumesStore = useSavedResumesStore.getState();
            savedResumesStore.refreshResumes();
            toast.success(`Resume "${state.data.versionName}" updated successfully!`);
          }
          
          // Clear the draft since it's now saved to backend
          localStorage.removeItem(STORAGE_KEYS.DRAFT);
          
        } catch (error: any) {
          console.error('Failed to save resume to backend:', error);
          set({ saveStatus: 'error' });
          
          // Handle specific error types
          if (error.response?.status === 409) {
            toast.error('A resume with this version name already exists. Please choose a different name.');
          } else if (error.response?.status === 403) {
            toast.error('You are not authorized to perform this action.');
          } else if (error.message === 'User not authenticated') {
            toast.error('Please log in to save your resume.');
          } else {
            toast.error('Failed to save resume. Please try again.');
          }
        }
      },

      loadDraft: () => {
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.DRAFT);
          if (!stored) return false;

          const parsed: ResumeDraft = JSON.parse(stored);
          if (parsed.metadata.version !== SCHEMA_VERSION) {
            console.warn('Draft version mismatch, migration may be needed');
          }

          set({
            data: parsed.data,
            lastSaved: parsed.metadata.lastSaved,
            isDirty: false,
            saveStatus: 'saved',
            hasDraft: true,
          });
          return true;
        } catch (error) {
          console.error('Failed to load draft:', error);
          return false;
        }
      },

      clearDraft: () => {
        try {
          localStorage.removeItem(STORAGE_KEYS.DRAFT);
          set({ hasDraft: false, lastSaved: null });
        } catch (error) {
          console.error('Failed to clear draft:', error);
        }
      },

      markAsSaved: () => {
        set({
          isDirty: false,
          saveStatus: 'saved',
          lastSaved: new Date().toISOString(),
        });
      },

      // Auto-save Settings
      setAutoSaveEnabled: (enabled) => {
        set({ autoSaveEnabled: enabled });
      },

      // UI State
      setActiveSection: (section) => {
        set({ activeSection: section });
      },

      // Load from External Data
      loadFromData: (data) => {
        const baseData = createEmptyResumeData();
        set({
          data: { ...baseData, ...data },
          isDirty: false,
          saveStatus: 'idle',
        });
      },
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        autoSaveEnabled: state.autoSaveEnabled,
        activeSection: state.activeSection,
      }),
    }
  )
);

// ============================================================================
// Selector Hooks for Performance
// ============================================================================

export const useResumeData = () => useResumeBuilderStore((state) => state.data);
export const usePersonalInfo = () => useResumeBuilderStore((state) => state.data.personal);
export const useSummary = () => useResumeBuilderStore((state) => state.data.summary);
export const useExperiences = () => useResumeBuilderStore((state) => state.data.experiences);
export const useEducation = () => useResumeBuilderStore((state) => state.data.education);
export const useSkills = () => useResumeBuilderStore((state) => state.data.skills);
export const useProjects = () => useResumeBuilderStore((state) => state.data.projects);
export const useCertifications = () => useResumeBuilderStore((state) => state.data.certifications);
export const useSaveStatus = () => useResumeBuilderStore(
  useShallow((state) => ({
    isDirty: state.isDirty,
    saveStatus: state.saveStatus,
    lastSaved: state.lastSaved,
  }))
);
export const useAutoSaveEnabled = () => useResumeBuilderStore((state) => state.autoSaveEnabled);
