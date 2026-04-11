import { useCallback, useEffect, useRef } from "react";
import { useResumeBuilderStore } from "../stores/resume-builder-store";

interface UseAutoSaveOptions {
  debounceMs?: number;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const { debounceMs = 2000, onSave, onError } = options;
  const isDirty = useResumeBuilderStore((state) => state.isDirty);
  const autoSaveEnabled = useResumeBuilderStore(
    (state) => state.autoSaveEnabled
  );
  const saveDraft = useResumeBuilderStore((state) => state.saveDraft);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

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

  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveDraft();
  }, [saveDraft]);

  return { saveNow };
}

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
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, saveDraft]);
}
