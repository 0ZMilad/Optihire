"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import { Main } from "@/components/main";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ResumeReviewForm } from "@/components/resume-review-form";
import { DashboardUI } from "@/components/dashboard";
import { useResumeUpload } from "@/hooks/use-resume-upload";
import { updateResume } from "@/middle-service/resumes";
import { ResumeComplete } from "@/middle-service/types";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";

export default function DashboardPage() {
  const {
    appState,
    parsedResumeData,
    statusData,
    error,
    handleUpload,
    resetUpload,
  } = useResumeUpload();

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Track if we've already automatically opened the review for the current completion
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (appState === "DONE" && !isReviewOpen && !hasAutoOpened.current) {
      setIsReviewOpen(true);
      hasAutoOpened.current = true;
    }
    
    // Reset the flag when we're not in DONE state anymore (e.g. new upload started)
    if (appState !== "DONE") {
      hasAutoOpened.current = false;
    }
  }, [appState, isReviewOpen]);

  const handleSaveResume = async (editedData: Partial<ResumeComplete>) => {
    if (!parsedResumeData) return;

    try {
      await updateResume(parsedResumeData.id, editedData);
      toast.success(SUCCESS_MESSAGES.SAVE_COMPLETED);
      resetUpload();
    } catch (err) {
      logger.error("Failed to save resume", { error: err instanceof Error ? err.message : "Unknown error" });
      toast.error(ERROR_MESSAGES.SAVE_FAILED);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      handleUpload(file);
    }
  };

  return (
    <DashboardLayout>
      <DashboardHeader />

      <Main>
        <DashboardUI
          appState={appState}
          fileName={fileName}
          inputRef={inputRef}
          error={error}
          onFileChange={handleFileChange}
          onUploadClick={() => inputRef.current?.click()}
          onReviewClick={() => setIsReviewOpen(true)}
          statusMessage={statusData?.message}
        />

        {/* Review Dialog */}
        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="sm:max-w-none w-[95vw] h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b shrink-0">
              <DialogTitle>Review Extracted Data</DialogTitle>
              <DialogDescription>
                Compare with your original document and edit any details.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden p-6">
              {parsedResumeData && (
                <ResumeReviewForm
                  resumeData={parsedResumeData}
                  showPdfViewer={true}
                  onSave={async (data) => {
                    await handleSaveResume(data);
                    setIsReviewOpen(false);
                  }}
                  onCancel={() => setIsReviewOpen(false)}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Main>
    </DashboardLayout>
  );
}
