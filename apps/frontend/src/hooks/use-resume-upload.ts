import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { uploadResume, getResumeData } from '@/middle-service/resumes';
import { useResumePolling } from './use-resume-polling';
import { ResumeRead } from '@/middle-service/types';

export type AppState = 'IDLE' | 'PROCESSING' | 'DONE';

export function useResumeUpload() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<ResumeRead | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialise polling hook. It will only activate when uploadedResumeId is set.
  const { statusData, isPolling } = useResumePolling(uploadedResumeId, {
    onComplete: async (id) => {
      try {
        // Fetch the full parsed data object once status is 'completed'
        const data = await getResumeData(id);
        setParsedResumeData(data);
        setAppState('DONE');
        toast.success("Resume parsed successfully");
      } catch (err) {
        setError("Failed to retrieve final resume details");
        setAppState('IDLE');
        setUploadedResumeId(null);
        toast.error("Parsing completed but failed to load data");
      }
    },
    onError: (msg) => {
      setError(msg);
      setAppState('IDLE');
      setUploadedResumeId(null); // Stop polling
      toast.error(msg);
    }
  });

  const handleUpload = useCallback(async (file: File) => {
    // 1. Validation
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PDF or DOCX.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("File is too large (max 5MB).");
      return;
    }

    // 2. Reset State & Start
    setError(null);
    setAppState('PROCESSING');

    try {
      const response = await uploadResume(file);
      // Setting this ID automatically triggers the useResumePolling hook
      setUploadedResumeId(response.id);
    } catch (err) {
      setError("Upload failed. Please try again.");
      setAppState('IDLE');
      toast.error("Failed to upload file");
    }
  }, []);

  const resetUpload = useCallback(() => {
    setAppState('IDLE');
    setUploadedResumeId(null);
    setParsedResumeData(null);
    setError(null);
  }, []);

  return {
    appState,
    parsedResumeData,
    statusData, // Expose current status message for the processing UI
    error,
    isPolling,
    handleUpload,
    resetUpload
  };
}