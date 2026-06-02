"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  ChevronDown,
  ClipboardCheck,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useAuditHistory } from "@/stores/audit-history-store";
import { useSavedResumes } from "@/stores/saved-resumes-store";
import { getActiveResume } from "@/middle-service/resumes";
import { getJobMatches } from "@/middle-service/jobs";

interface QuickStatsGridProps {
  className?: string;
  atsExpanded?: boolean;
  onToggleATS?: () => void;
}

export default function QuickStatsGrid({
  className,
  atsExpanded = false,
  onToggleATS,
}: QuickStatsGridProps) {
  const { resumes, isLoading: resumesLoading } = useSavedResumes();
  const { history, isLoading: auditsLoading } = useAuditHistory();
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const resumeCount = resumes.length;
  const auditCount = history.length;
  const latestScore = history[0]?.overall_score ?? null;

  useEffect(() => {
    let cancelled = false;
    async function fetchApplications() {
      try {
        const resume = await getActiveResume();
        const matches = await getJobMatches(resume.id);
        if (!cancelled) {
          setAppliedCount(
            matches.filter((m) => m.application_status !== "not_applied").length
          );
        }
      } catch {
        // No active resume or no matches — leave as null
      }
    }
    fetchApplications();
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className || ""}`}
    >
      {/* Resumes */}
      <div className="rounded-xl border p-6 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Resumes</span>
          <FileText className="size-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-semibold">
            {resumesLoading ? "—" : resumeCount}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {resumeCount === 0 && !resumesLoading
            ? "Upload or build your first resume"
            : "Saved in your library"}
        </p>
      </div>

      {/* ATS Audits */}
      <div className="rounded-xl border p-6 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">ATS Audits</span>
          <ClipboardCheck
            className="size-4 text-muted-foreground"
            aria-hidden
          />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-semibold">
            {auditsLoading ? "—" : auditCount}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {auditCount === 0 && !auditsLoading
            ? "Run your first audit to get a score"
            : "Audits completed"}
        </p>
      </div>

      {/* Applications */}
      <div className="rounded-xl border p-6 hover:bg-muted/40 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Applications</span>
          <Briefcase className="size-4 text-muted-foreground" aria-hidden />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-semibold">
            {appliedCount !== null ? appliedCount : "—"}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {appliedCount === null
            ? "Upload a resume to see matches"
            : "Jobs applied to or tracked"}
        </p>
      </div>

      {/* Latest ATS Score */}
      <div
        className={`rounded-xl border p-6 transition-colors ${
          atsExpanded ? "bg-muted/40" : "hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Latest ATS Score
          </span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
            {onToggleATS && (
              <button
                type="button"
                onClick={onToggleATS}
                aria-label={
                  atsExpanded
                    ? "Hide ATS score details"
                    : "Show ATS score details"
                }
                aria-expanded={atsExpanded}
                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronDown
                  className={`size-4 transition-transform duration-200 ${
                    atsExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-semibold">
            {auditsLoading
              ? "—"
              : latestScore !== null
                ? `${latestScore}%`
                : "—"}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {latestScore === null && !auditsLoading
            ? "Run an audit to see your score"
            : "From your most recent audit"}
        </p>
      </div>
    </section>
  );
}
