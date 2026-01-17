"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ResumeUpload } from "@/components/resume-upload";
import { ResumeProcessing } from "@/components/resume-processing";
import { ResumeReviewForm } from "@/components/resume-review-form";
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

  return (
    <DashboardLayout>
      <DashboardHeader>
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Upload Resume
            </Button>
          </div>
        </div>
      </DashboardHeader>

      <Main>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here's an overview of your applications.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  Start applying to jobs
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Jobs
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  Jobs you're tracking
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Interview Rate
                </p>
                <p className="text-3xl font-bold">0%</p>
                <p className="text-xs text-muted-foreground">
                  Applications to interviews
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  ATS Score
                </p>
                <p className="text-3xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">
                  Upload resume to analyse
                </p>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  Upload Resume
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Search Jobs
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Analyse Resume
                </Button>
                {appState === "DONE" && (
                  <Button 
                    className="w-full justify-start" 
                    variant="default"
                    onClick={() => setIsReviewOpen(true)}
                  >
                    Review Parsed Resume
                  </Button>
                )}
              </div>
            </Card>

            {appState !== "PROCESSING" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Upload New Resume
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your resume to get started with AI-powered analysis
                  and job matching.
                </p>
                <div className="min-h-[200px]">
                  <ResumeUpload
                    onFileSelect={handleUpload}
                    disabled={false}
                    error={error}
                  />
                </div>
              </Card>
            )}

            {appState === "PROCESSING" && (
              <div className="md:col-span-1">
                <ResumeProcessing statusMessage={statusData?.message} />
              </div>
            )}

            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Review Extracted Data</DialogTitle>
                  <DialogDescription>
                    Our AI extracted this information. Please verify and edit any missing details before continuing.
                  </DialogDescription>
                </DialogHeader>
                {parsedResumeData && (
                  <ResumeReviewForm
                    resumeData={parsedResumeData}
                    onSave={async (data) => {
                      await handleSaveResume(data);
                      setIsReviewOpen(false);
                    }}
                    onCancel={() => setIsReviewOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Main>
    </DashboardLayout>
  );
}
