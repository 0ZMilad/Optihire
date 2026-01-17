import { useEffect, useRef, useState } from "react";
import { getResumeParseStatus } from "@/middle-service/resumes";
import { ResumeParseStatusResponse } from "@/middle-service/types";
import { RESUME_POLLING } from "@/lib/constants";

interface PollingOptions {
  onComplete?: (resumeId: string) => void;
  onError?: (error: string) => void;
  interval?: number;
  maxAttempts?: number;
}

export const useResumePolling = (
  resumeId: string | null,
  options: PollingOptions = {}
) => {
  // Use state for data so UI updates when status message changes
  const [statusData, setStatusData] = useState<ResumeParseStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  
  // Use ref for counters to avoid dependency loop in useEffect
  const attemptCount = useRef<number>(0);

  const { 
    onComplete, 
    onError, 
    interval = RESUME_POLLING.INTERVAL, 
    maxAttempts = RESUME_POLLING.MAX_ATTEMPTS 
  } = options;

  // Use refs for callbacks to avoid dependency loops
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    // 1. Don't poll if no ID provided
    if (!resumeId) {
      setIsPolling(false);
      setStatusData(null);
      attemptCount.current = 0;
      return;
    }

    setIsPolling(true);
    attemptCount.current = 0;
    setStatusData(null);
    let timerId: NodeJS.Timeout | null = null;
    let isCancelled = false; 

    const poll = async () => {
      if (isCancelled) return; 

      try {
        attemptCount.current += 1;

        const data = await getResumeParseStatus(resumeId);
        
        if (isCancelled) return; 
        setStatusData(data);

        // CASE: Completed
        if (data.status === "Completed") {
          setIsPolling(false);
          if (onCompleteRef.current && !isCancelled) onCompleteRef.current(resumeId);
          return; 
        }

        // CASE: Failed
        if (data.status === "Failed") {
          setIsPolling(false);
          if (onErrorRef.current && !isCancelled) onErrorRef.current(data.error_details || "Parsing failed");
          return;
        }

        // CASE: Timeout
        if (attemptCount.current >= maxAttempts) {
          setIsPolling(false);
          if (onErrorRef.current && !isCancelled) onErrorRef.current("Operation timed out");
          return;
        }

        // CASE: Pending/Processing - Schedule next poll
        if (!isCancelled) {
          timerId = setTimeout(poll, interval);
        }

      } catch (error) {
        if (!isCancelled) {
          setIsPolling(false);
          if (onErrorRef.current) onErrorRef.current("Network error during polling");
        }
      }
    };

    // Start polling
    poll();

    // Cleanup on unmount - prevent memory leaks
    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };

  }, [resumeId, interval, maxAttempts]); 

  return { statusData, isPolling };
};