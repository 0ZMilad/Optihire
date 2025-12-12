import { useEffect, useRef, useState } from "react";
import { getResumeParseStatus } from "@/middle-service/resumes";
import { ResumeParseStatusResponse } from "@/middle-service/types";

interface PollingOptions {
  onComplete?: (resumeId: string) => void;
  onError?: (error: string) => void;
  interval?: number;     // default 2000ms
  maxAttempts?: number;  // default 60
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
    interval = 2000, 
    maxAttempts = 60 
  } = options;

  useEffect(() => {
    // 1. Don't poll if no ID provided
    if (!resumeId) {
      setIsPolling(false);
      setStatusData(null);
      attemptCount.current = 0;
      return;
    }

    setIsPolling(true);
    let timerId: NodeJS.Timeout;

    const poll = async () => {
      try {
        attemptCount.current += 1;

        const data = await getResumeParseStatus(resumeId);
        setStatusData(data);

        // CASE: Completed
        if (data.status === "completed") {
          setIsPolling(false);
          if (onComplete) onComplete(resumeId);
          return; 
        }

        // CASE: Failed
        if (data.status === "failed") {
          setIsPolling(false);
          if (onError) onError(data.error_details || "Parsing failed");
          return;
        }

        // CASE: Timeout
        if (attemptCount.current >= maxAttempts) {
          setIsPolling(false);
          if (onError) onError("Operation timed out");
          return;
        }

        // CASE: Pending/Processing - Schedule next poll
        timerId = setTimeout(poll, interval);

      } catch (error) {
        setIsPolling(false);
        if (onError) onError("Network error during polling");
      }
    };

    // Start polling
    poll();

    // Cleanup on unmount
    return () => clearTimeout(timerId);

  }, [resumeId, interval, maxAttempts]); 

  return { statusData, isPolling };
};