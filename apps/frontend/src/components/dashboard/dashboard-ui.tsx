"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { useAuditHistory } from "@/stores/audit-history-store";
import { useSavedResumes } from "@/stores/saved-resumes-store";
import ATSScoreWidget from "./ats-score-widget";
import DashboardWidgets from "./dashboard-widgets";
import QuickActions from "./quick-actions";
import QuickStatsGrid from "./quick-stats-grid";
import ResumeUpload from "./resume-upload";

interface DashboardUIProps {
  className?: string;
  appState: string;
  fileName: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadClick: () => void;
  onReviewClick?: () => void;
  statusMessage?: string;
}

type NextAction = {
  label: string;
  title: string;
  description: string;
  primary: string;
  href?: string;
  onPrimaryClick?: () => void | Promise<void>;
  secondary?: string;
  secondaryHref?: string;
};

export default function DashboardUI({
  className,
  appState,
  fileName,
  inputRef,
  error,
  onFileChange,
  onUploadClick,
  onReviewClick,
  statusMessage,
}: DashboardUIProps) {
  const [atsExpanded, setAtsExpanded] = useState(false);
  const {
    resumes,
    isLoading: resumesLoading,
    error: resumesError,
    refresh: refreshResumes,
  } = useSavedResumes();
  const {
    history,
    isLoading: auditsLoading,
    error: auditsError,
  } = useAuditHistory();

  const handleToggleATS = useCallback(() => setAtsExpanded((v) => !v), []);
  const readyResumes = useMemo(
    () => resumes.filter((resume) => resume.processing_status === "Completed"),
    [resumes]
  );

  const latestAudit = history[0] ?? null;
  const hasResume = resumes.length > 0;
  const hasReadyResume = readyResumes.length > 0;
  const hasAudit = history.length > 0;

  const nextAction: NextAction = useMemo(() => {
    if (resumesError) {
      return {
        label: "Resume library unavailable",
        title: "Reconnect your resume workspace",
        description:
          "OptiHire could not load your saved resumes. Retry before running audits or reviewing job matches.",
        primary: "Retry resumes",
        onPrimaryClick: refreshResumes,
      };
    }

    if (appState === "PROCESSING") {
      return {
        label: "Resume processing",
        title: "Your resume is being parsed",
        description:
          statusMessage ||
          "Keep this page open while OptiHire extracts the resume details needed for audits and job matching.",
        primary: "Processing",
      };
    }

    if (appState === "DONE") {
      return {
        label: "Review ready",
        title: "Check the extracted resume details",
        description:
          "Review the parsed fields now so audits and job matches are based on clean resume data.",
        primary: "Review extracted data",
        onPrimaryClick: onReviewClick,
      };
    }

    if (!hasResume && !resumesLoading) {
      return {
        label: "Start here",
        title: "Upload or create your first resume",
        description:
          "Resume data powers ATS audits and curated job matches. Upload a file or open the builder to get started.",
        primary: "Upload resume",
        onPrimaryClick: onUploadClick,
        secondary: "Open builder",
        secondaryHref: "/dashboard/resumes",
      };
    }

    if (hasResume && !hasReadyResume) {
      return {
        label: "Resume not ready",
        title: "Wait for resume processing to finish",
        description:
          "A parsed resume is required before you can run a useful ATS audit or review curated matches.",
        primary: "View resumes",
        href: "/dashboard/resumes",
      };
    }

    if (!hasAudit && !auditsLoading) {
      return {
        label: "Next step",
        title: "Run an ATS audit against a job description",
        description:
          "Audits identify keyword gaps and unlock better context for choosing which curated matches deserve action.",
        primary: "Run ATS audit",
        href: "/dashboard/audit",
      };
    }

    return {
      label: "Ready to review",
      title: "Review curated job matches",
      description:
        "Scan recommended roles, compare match quality, and update each application status as you move forward.",
      primary: "Open Job Matches",
      href: "/dashboard/jobs",
    };
  }, [
    appState,
    auditsLoading,
    hasAudit,
    hasReadyResume,
    hasResume,
    onReviewClick,
    onUploadClick,
    refreshResumes,
    resumesError,
    resumesLoading,
    statusMessage,
  ]);

  const workflowSteps = [
    {
      label: "Resume ready",
      done: hasReadyResume,
      hint: hasReadyResume
        ? `${readyResumes.length} parsed resume${readyResumes.length === 1 ? "" : "s"}`
        : "Upload or finish parsing",
    },
    {
      label: "ATS audit run",
      done: hasAudit,
      hint: hasAudit
        ? `${history.length} saved audit${history.length === 1 ? "" : "s"}`
        : "Compare against a job description",
    },
    {
      label: "Job matches reviewed",
      done: hasAudit,
      hint: hasAudit ? "Open Job Matches" : "Available after an audit",
    },
    {
      label: "Application status tracked",
      done: hasAudit,
      hint: "Update status on each match",
    },
  ];

  return (
    <div className={`mx-auto max-w-7xl space-y-8 px-4 ${className || ""}`}>
      <PageHeading
        eyebrow="Workspace"
        title="Job search dashboard"
        description="Keep resume optimisation, ATS audits, curated matches, and application status tracking in one place."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/audit">Run audit</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/resumes">Open builder</Link>
            </Button>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <div className="rounded-lg border bg-card p-5 shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {nextAction.label}
              </p>
              <h2 className="text-xl font-semibold tracking-tight">
                {nextAction.title}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {nextAction.description}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {nextAction.href ? (
                <Button asChild>
                  <Link href={nextAction.href}>{nextAction.primary}</Link>
                </Button>
              ) : (
                <Button
                  onClick={nextAction.onPrimaryClick}
                  disabled={!nextAction.onPrimaryClick}
                >
                  {nextAction.primary}
                </Button>
              )}
              {nextAction.secondaryHref && (
                <Button variant="outline" asChild>
                  <Link href={nextAction.secondaryHref}>
                    {nextAction.secondary}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20 p-5">
          <h2 className="text-sm font-semibold">Workspace flow</h2>
          <ol className="mt-4 space-y-3 text-sm" aria-label="Workspace setup">
            {workflowSteps.map((item, index) => (
              <li key={item.label} className="flex gap-3">
                <span
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    item.done
                      ? "border-score-strong/30 bg-score-strong/10 text-score-strong"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                  aria-hidden
                >
                  {item.done ? (
                    <Check className="size-3.5" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.hint}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mt-8 space-y-4">
        <QuickStatsGrid
          resumesCount={resumes.length}
          readyResumesCount={readyResumes.length}
          auditsCount={history.length}
          latestAuditScore={latestAudit?.overall_score ?? null}
          resumesLoading={resumesLoading}
          auditsLoading={auditsLoading}
          resumesError={resumesError}
          auditsError={auditsError}
          atsExpanded={atsExpanded}
          onToggleATS={handleToggleATS}
        />
        {atsExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <ATSScoreWidget />
          </div>
        )}
      </div>

      <ResumeUpload
        className="mt-8"
        appState={appState}
        fileName={fileName}
        inputRef={inputRef}
        error={error}
        onFileChange={onFileChange}
        onReviewClick={onReviewClick}
        onUploadClick={onUploadClick}
        statusMessage={statusMessage}
      />

      <QuickActions className="mt-10" />

      <DashboardWidgets className="mt-10" />
    </div>
  );
}
