import { useEffect, useRef, useCallback } from 'react';
import { useResumeBuilderStore, useSaveStatus } from '../stores/resume-builder-store';

// ============================================================================
// useAutoSave Hook
// Automatically saves the resume draft when changes are detected
// ============================================================================

interface UseAutoSaveOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Callback when auto-save completes */
  onSave?: () => void;
  /** Callback when auto-save fails */
  onError?: (error: Error) => void;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const { debounceMs = 2000, onSave, onError } = options;
  
  const isDirty = useResumeBuilderStore((state) => state.isDirty);
  const autoSaveEnabled = useResumeBuilderStore((state) => state.autoSaveEnabled);
  const saveDraft = useResumeBuilderStore((state) => state.saveDraft);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      try {
        saveDraft();
        onSave?.();
      } catch (error) {
        onError?.(error as Error);
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, autoSaveEnabled, debounceMs, saveDraft, onSave, onError]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveDraft();
  }, [saveDraft]);

  return { saveNow };
}

// ============================================================================
// useDraftRecovery Hook
// Handles detection and recovery of unsaved drafts
// ============================================================================

interface UseDraftRecoveryOptions {
  /** Callback when a draft is found */
  onDraftFound?: (lastSaved: string) => void;
  /** Auto-load draft on mount */
  autoLoad?: boolean;
}

export function useDraftRecovery(options: UseDraftRecoveryOptions = {}) {
  const { onDraftFound, autoLoad = false } = options;
  
  const hasDraft = useResumeBuilderStore((state) => state.hasDraft);
  const lastSaved = useResumeBuilderStore((state) => state.lastSaved);
  const loadDraft = useResumeBuilderStore((state) => state.loadDraft);
  const clearDraft = useResumeBuilderStore((state) => state.clearDraft);
  const reset = useResumeBuilderStore((state) => state.reset);
  const initialize = useResumeBuilderStore((state) => state.initialize);
  const isInitialized = useResumeBuilderStore((state) => state.isInitialized);

  // Initialize store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Notify when draft is found
  useEffect(() => {
    if (hasDraft && lastSaved && onDraftFound) {
      onDraftFound(lastSaved);
    }
  }, [hasDraft, lastSaved, onDraftFound]);

  // Auto-load draft if enabled
  useEffect(() => {
    if (autoLoad && hasDraft && isInitialized) {
      loadDraft();
    }
  }, [autoLoad, hasDraft, isInitialized, loadDraft]);

  const recoverDraft = useCallback(() => {
    return loadDraft();
  }, [loadDraft]);

  const discardDraft = useCallback(() => {
    clearDraft();
    reset();
  }, [clearDraft, reset]);

  const formatLastSaved = useCallback((dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }, []);

  return {
    hasDraft,
    lastSaved,
    lastSavedFormatted: formatLastSaved(lastSaved),
    recoverDraft,
    discardDraft,
    isInitialized,
  };
}

// ============================================================================
// useResumeBuilder Hook
// Main hook combining all resume builder functionality
// ============================================================================

interface UseResumeBuilderOptions {
  autoSave?: boolean;
  autoSaveDebounceMs?: number;
  autoLoadDraft?: boolean;
}

export function useResumeBuilder(options: UseResumeBuilderOptions = {}) {
  const {
    autoSave = true,
    autoSaveDebounceMs = 2000,
    autoLoadDraft = true,
  } = options;

  // Get store state and actions
  const store = useResumeBuilderStore();
  const { isDirty, saveStatus, lastSaved } = useSaveStatus();
  
  // Setup auto-save
  const { saveNow } = useAutoSave({
    debounceMs: autoSaveDebounceMs,
  });

  // Setup draft recovery
  const {
    hasDraft,
    lastSavedFormatted,
    recoverDraft,
    discardDraft,
    isInitialized,
  } = useDraftRecovery({
    autoLoad: autoLoadDraft,
  });

  // Toggle auto-save
  const toggleAutoSave = useCallback(() => {
    store.setAutoSaveEnabled(!store.autoSaveEnabled);
  }, [store]);

  return {
    // Data
    data: store.data,
    
    // Status
    isDirty,
    saveStatus,
    lastSaved,
    lastSavedFormatted,
    hasDraft,
    isInitialized,
    autoSaveEnabled: store.autoSaveEnabled,
    
    // Personal info actions
    updatePersonalInfo: store.updatePersonalInfo,
    setPersonalInfo: store.setPersonalInfo,
    
    // Summary action
    updateSummary: store.updateSummary,
    
    // Experience actions
    addExperience: store.addExperience,
    updateExperience: store.updateExperience,
    removeExperience: store.removeExperience,
    reorderExperiences: store.reorderExperiences,
    
    // Education actions
    addEducation: store.addEducation,
    updateEducation: store.updateEducation,
    removeEducation: store.removeEducation,
    reorderEducation: store.reorderEducation,
    
    // Skills actions
    addSkill: store.addSkill,
    updateSkill: store.updateSkill,
    removeSkill: store.removeSkill,
    reorderSkills: store.reorderSkills,
    
    // Projects actions
    addProject: store.addProject,
    updateProject: store.updateProject,
    removeProject: store.removeProject,
    reorderProjects: store.reorderProjects,
    
    // Certifications actions
    addCertification: store.addCertification,
    updateCertification: store.updateCertification,
    removeCertification: store.removeCertification,
    reorderCertifications: store.reorderCertifications,
    
    // Section ordering
    reorderSections: store.reorderSections,
    
    // Template
    setTemplate: store.setTemplate,
    
    // Version management
    setVersionName: store.setVersionName,
    setIsPrimary: store.setIsPrimary,
    
    // Draft management
    saveNow,
    saveDraft: store.saveDraft,
    recoverDraft,
    discardDraft,
    clearDraft: store.clearDraft,
    
    // Auto-save
    toggleAutoSave,
    setAutoSaveEnabled: store.setAutoSaveEnabled,
    
    // UI
    activeSection: store.activeSection,
    setActiveSection: store.setActiveSection,
    
    // Load external data
    loadFromData: store.loadFromData,
    
    // Reset
    reset: store.reset,
  };
}

// ============================================================================
// useBeforeUnload Hook
// Warns user about unsaved changes when leaving the page
// ============================================================================

export function useBeforeUnload() {
  const isDirty = useResumeBuilderStore((state) => state.isDirty);
  const saveDraft = useResumeBuilderStore((state) => state.saveDraft);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        // Attempt to save before unload
        saveDraft();
        
        // Show browser warning
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveDraft]);
}

// Default export
export default useResumeBuilder;
