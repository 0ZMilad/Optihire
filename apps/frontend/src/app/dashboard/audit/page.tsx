"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Main } from "@/components/main";
import { AuditInputView } from "@/components/audit/audit-input-view";
import { AuditResultsView } from "@/components/audit/audit-results-view";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserResumes } from "@/middle-service/resumes";
import { runAudit } from "@/middle-service/audit";
import type { ResumeListItem } from "@/middle-service/types";
import type { AuditResult, AuditContext } from "@/middle-service/audit";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

type ViewState = "input" | "loading" | "results";

export default function AuditPage() {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [context, setContext] = useState<AuditContext | null>(null);

  // Fetch user's resumes on mount
  useEffect(() => {
    async function fetchResumes() {
      try {
        const data = await getUserResumes();
        setResumes(data);
      } catch (err) {
        logger.error("Failed to load resumes", {
          error: err instanceof Error ? err.message : "Unknown error",
        });
        toast.error("Failed to load your resumes. Please try again.");
      } finally {
        setResumesLoading(false);
      }
    }
    fetchResumes();
  }, []);

  const handleSubmit = useCallback(
    async (resumeId: string, jobDescription: string) => {
      const resume = resumes.find((r) => r.id === resumeId);
      if (!resume) return;

      setAuditLoading(true);
      setViewState("loading");

      try {
        const auditResult = await runAudit({
          resume_id: resumeId,
          job_description: jobDescription,
        });

        setResult(auditResult);
        setContext({
          resume,
          jobDescription,
        });
        setViewState("results");
      } catch (err) {
        logger.error("Audit failed", {
          error: err instanceof Error ? err.message : "Unknown error",
        });
        toast.error("Analysis failed. Please try again.");
        setViewState("input");
      } finally {
        setAuditLoading(false);
      }
    },
    [resumes],
  );

  const handleRunAnother = useCallback(() => {
    setResult(null);
    setContext(null);
    setViewState("input");
  }, []);

  return (
    <DashboardLayout>
      <DashboardHeader>
        <h2 className="text-lg font-semibold">ATS Audit</h2>
      </DashboardHeader>

      <Main>
        {resumesLoading && (
          <div className="mx-auto w-full max-w-[800px] space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[280px] w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!resumesLoading && viewState === "input" && (
          <AuditInputView
            resumes={resumes}
            loading={auditLoading}
            onSubmit={handleSubmit}
          />
        )}

        {viewState === "loading" && (
          <div className="mx-auto w-full max-w-[800px] flex flex-col items-center justify-center gap-6 py-20">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 rounded-full border-4 border-muted animate-ping opacity-20" />
              <div className="h-20 w-20 rounded-full border-4 border-t-primary border-muted animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold">Running ATS Audit…</p>
              <p className="text-sm text-muted-foreground">
                Comparing your resume against the job description.
              </p>
            </div>
          </div>
        )}

        {viewState === "results" && result && context && (
          <AuditResultsView
            result={result}
            context={context}
            onRunAnother={handleRunAnother}
          />
        )}
      </Main>
    </DashboardLayout>
  );
}
