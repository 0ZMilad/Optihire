"use client";

import { useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Main } from "@/components/main";
import { AuditInputView } from "@/components/audit/audit-input-view";
import { AuditHistorySidebar } from "@/components/audit/audit-history-sidebar";
import dynamic from "next/dynamic";

// Lazy-load the heavy results view — only fetched after audit completes
const AuditResultsView = dynamic(
  () => import("@/components/audit/audit-results-view").then((m) => m.AuditResultsView),
  { ssr: false }
);

import { Skeleton } from "@/components/ui/skeleton";
import { runAudit, getAuditResult, deleteAuditResult } from "@/middle-service/audit";
import type { AuditResult, AuditContext } from "@/middle-service/audit";
import { useSavedResumes } from "@/stores/saved-resumes-store";
import { useAuditHistory } from "@/stores/audit-history-store";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import axios from "axios";

type ViewState = "input" | "loading" | "results";

export default function AuditPage() {
  const [viewState, setViewState] = useState<ViewState>("input");
  // Use the cached store instead of a fresh API call — avoids duplicate fetch
  const { resumes, isLoading: resumesLoading } = useSavedResumes();
  const { history, isLoading: historyLoading, prependResult, removeResult } = useAuditHistory();
  const [auditLoading, setAuditLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [context, setContext] = useState<AuditContext | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSubmit = useCallback(
    async (resumeId: string, jobDescription: string) => {
      const resume = resumes.find((r) => r.id === resumeId);
      if (!resume) return;

      if (resume.processing_status !== "Completed") {
        toast.error(
          "This resume hasn't finished processing yet. Please wait until parsing is complete before running an audit."
        );
        return;
      }

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
        prependResult(auditResult);
        setViewState("results");
      } catch (err) {
        let userMessage = "Analysis failed. Please try again.";
        let logError = "Unknown error";
        let logStatus: string | undefined;

        if (axios.isAxiosError(err)) {
          // Ignore request cancellations (e.g. React StrictMode double-invoke)
          if (axios.isCancel(err)) {
            setViewState("input");
            return;
          }
          logStatus = String(err.response?.status ?? err.code ?? "") || undefined;
          const raw = err.response?.data?.detail;
          const detail =
            typeof raw === "string" && raw
              ? raw
              : Array.isArray(raw) && raw.length
                ? (raw as Array<{ msg?: string }>)
                    .map((d) => d?.msg || JSON.stringify(d))
                    .join("; ")
                : "";
          if (detail) userMessage = detail;
          // Use || (not ??) so empty strings are skipped
          logError = detail || err.message || err.code || `HTTP ${err.response?.status}` || "Axios error";
        } else if (err instanceof Error) {
          logError = err.message || err.name || "Error";
        } else if (typeof err === "string") {
          logError = err || "Unknown error";
        } else {
          logError = JSON.stringify(err) || "Unknown error";
        }

        // Embed error in message so it's always visible in the console
        // even if the context object renders as {}
        logger.error(`Audit failed: ${logError}`, {
          error: logError,
          ...(logStatus ? { status: logStatus } : {}),
        });
        toast.error(userMessage);
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

  const handleSelectHistory = useCallback(
    async (selected: AuditResult) => {
      const resume = resumes.find((r) => r.id === selected.resume_id);
      if (!resume) {
        toast.error("Could not find the resume associated with this audit.");
        return;
      }
      try {
        const full = await getAuditResult(selected.id);
        setResult(full);
        setContext({ resume, jobDescription: "" });
        setViewState("results");
      } catch {
        toast.error("Failed to load audit result.");
      }
    },
    [resumes],
  );

  const handleDeleteHistory = useCallback(
    async (id: string) => {
      try {
        await deleteAuditResult(id);
        removeResult(id);
        // If the deleted result is currently displayed, go back to input
        if (result?.id === id) {
          setResult(null);
          setContext(null);
          setViewState("input");
        }
      } catch {
        toast.error("Failed to delete audit result.");
      }
    },
    [result, removeResult],
  );

  return (
    <>
      <DashboardHeader>
        <h2 className="text-lg font-semibold">ATS Audit</h2>
      </DashboardHeader>

      <Main className="flex min-h-0 overflow-hidden p-0 max-w-none mx-0">
        {/* ── Main scrollable content area ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
        </div>

        {/* ── History sidebar ── */}
        <AuditHistorySidebar
          history={history}
          isLoading={historyLoading}
          resumes={resumes}
          activeResultId={result?.id}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((o) => !o)}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
        />
      </Main>
    </>
  );
}
