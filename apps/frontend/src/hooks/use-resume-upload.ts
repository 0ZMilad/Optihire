import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { uploadResume, getResumeCompleteData } from '@/middle-service/resumes';
import { useResumePolling } from './use-resume-polling';
import { ResumeComplete } from '@/middle-service/types';
import { FILE_UPLOAD, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';

export type AppState = 'IDLE' | 'PROCESSING' | 'DONE';

export function useResumeUpload() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<ResumeComplete | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePollingComplete = useCallback(async (id: string) => {
    try {
      const data = await getResumeCompleteData(id);
      setParsedResumeData(data);
      setAppState('DONE');
      toast.success(SUCCESS_MESSAGES.PARSE_COMPLETED);
    } catch (err) {
      setError(ERROR_MESSAGES.PARSING_FAILED);
      setAppState('IDLE');
      setUploadedResumeId(null);
      toast.error(ERROR_MESSAGES.PARSING_DATA_MISSING);
    }
  }, []);

  const handlePollingError = useCallback((msg: string) => {
    setError(msg);
    setAppState('IDLE');
    setUploadedResumeId(null); // Stop polling
    toast.error(msg);
  }, []);

  // Initialise polling hook. It will only activate when uploadedResumeId is set.
  const { statusData, isPolling } = useResumePolling(uploadedResumeId, {
    onComplete: handlePollingComplete,
    onError: handlePollingError
  });

  const handleUpload = useCallback(async (file: File) => {
    if (!(FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      toast.error(ERROR_MESSAGES.FILE_TYPE);
      return;
    }

    if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
      toast.error(`${ERROR_MESSAGES.FILE_SIZE_EXCEEDED} (max ${FILE_UPLOAD.MAX_SIZE_MB}MB).`);
      return;
    }

    setError(null);
    setAppState('PROCESSING');

    try {
      const response = await uploadResume(file);
      // Setting this ID automatically triggers the useResumePolling hook
      setUploadedResumeId(response.id);
    } catch (err) {
      setError(ERROR_MESSAGES.UPLOAD_FAILED);
      setAppState('IDLE');
      toast.error(ERROR_MESSAGES.UPLOAD_ERROR_TOAST);
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