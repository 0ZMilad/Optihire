"use client";

import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Minus,
  PoundSterling,
  Trophy,
  XCircle,
} from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationStatus, JobMatch } from "@/lib/job-types";
import { cn } from "@/lib/utils";
import { updateApplicationStatus } from "@/middle-service/jobs";

// ─── Score helpers ───────────────────────────────────────────────────────────

function scoreBarColor(score: number) {
  if (score >= 80) return "bg-emerald-600";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function scoreBgColor(score: number) {
  if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string
): string {
  if (!min && !max) return "Not disclosed";
  const symbols: Record<string, string> = {
    USD: "$",
    GBP: "\u00a3",
    EUR: "\u20ac",
  };
  const sym = symbols[currency] ?? `${currency}\u00a0`;
  const fmt = (n: number) =>
    `${sym}${n >= 1000 ? `${Math.round(n / 1000)}k` : n}`;
  if (min && max) return `${fmt(min)} \u2013 ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

// ─── Label maps ─────────────────────────────────────────────────────────────

const REMOTE_TYPE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const EXP_LEVEL_LABELS: Record<string, string> = {
  entry: "Entry",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  graduate: "Graduate",
};

const SKILLS_VISIBLE = 5;

// ─── Application status config ───────────────────────────────────────────────
// Each entry has a distinct icon (no ambiguous double-dot), color-coded trigger,
// and icon color. "offer" uses purple to stand out from the green match score.

type StatusEntry = {
  label: string;
  triggerClass: string;
  Icon: React.ElementType;
  iconClass: string;
};

const STATUS_CONFIG: Record<ApplicationStatus, StatusEntry> = {
  not_applied: {
    label: "Not Applied",
    triggerClass:
      "text-muted-foreground border-muted-foreground/30 bg-muted/30 hover:bg-muted/50",
    Icon: Minus,
    iconClass: "text-muted-foreground",
  },
  applied: {
    label: "Applied",
    triggerClass: "text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100",
    Icon: CheckCircle2,
    iconClass: "text-blue-500",
  },
  interviewing: {
    label: "Interviewing",
    triggerClass:
      "text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100",
    Icon: Clock,
    iconClass: "text-amber-500",
  },
  offer: {
    label: "Offer Received",
    triggerClass:
      "text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100",
    Icon: Trophy,
    iconClass: "text-purple-500",
  },
  rejected: {
    label: "Rejected",
    triggerClass: "text-red-700 border-red-200 bg-red-50 hover:bg-red-100",
    Icon: XCircle,
    iconClass: "text-red-500",
  },
};

// Hoisted outside component — STATUS_CONFIG is static so this never changes
const STATUS_ENTRIES = Object.entries(STATUS_CONFIG) as [
  ApplicationStatus,
  StatusEntry,
][];

// ─── Component ───────────────────────────────────────────────────────────────

interface JobCardProps {
  match: JobMatch;
}

function JobCardInner({ match }: JobCardProps) {
  const [status, setStatus] = useState<ApplicationStatus>(
    match.application_status
  );
  const { job_listing: job } = match;

  const { visibleMatched, extraMatched, visibleMissing, extraMissing } =
    useMemo(
      () => ({
        visibleMatched: match.matched_skills.slice(0, SKILLS_VISIBLE),
        extraMatched: Math.max(0, match.matched_skills.length - SKILLS_VISIBLE),
        visibleMissing: match.missing_skills.slice(0, SKILLS_VISIBLE),
        extraMissing: Math.max(0, match.missing_skills.length - SKILLS_VISIBLE),
      }),
      [match.matched_skills, match.missing_skills]
    );

  const postedLabel = useMemo(
    () =>
      job.posted_date
        ? new Date(job.posted_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : null,
    [job.posted_date]
  );

  const handleStatusChange = useCallback(
    async (next: ApplicationStatus) => {
      const prev = status;
      setStatus(next);
      try {
        await updateApplicationStatus(match.id, next);
        if (next !== "not_applied") {
          toast.success(`Status: ${STATUS_CONFIG[next].label}`, {
            description: `${job.job_title} at ${job.company_name}`,
          });
        }
      } catch {
        setStatus(prev);
        toast.error("Failed to update application status. Please try again.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [match.id, status, job.job_title, job.company_name]
  );

  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="rounded-xl border bg-card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* ── Top row: company + score badge ──────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex items-center justify-center size-10 rounded-lg bg-muted text-muted-foreground shrink-0">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">
              {job.company_name}
            </p>
            <h3 className="text-base font-semibold leading-snug">
              {job.job_title}
            </h3>
          </div>
        </div>

        {/* Single source of truth for the score number */}
        <span
          className={cn(
            "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg border",
            scoreBgColor(match.match_score)
          )}
        >
          {match.match_score}% match
        </span>
      </div>

      {/* ── Meta chips ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {job.location && (
          <Badge variant="secondary" className="gap-1 font-normal">
            <MapPin className="size-3" />
            {job.location}
          </Badge>
        )}
        {job.remote_type && (
          <Badge variant="outline" className="font-normal">
            {REMOTE_TYPE_LABELS[job.remote_type] ?? job.remote_type}
          </Badge>
        )}
        {job.job_type && (
          <Badge variant="outline" className="font-normal">
            {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}
          </Badge>
        )}
        {job.experience_level && (
          <Badge variant="outline" className="font-normal">
            {EXP_LEVEL_LABELS[job.experience_level] ?? job.experience_level}
          </Badge>
        )}
        {postedLabel && (
          <Badge variant="secondary" className="gap-1 font-normal">
            <Clock className="size-3" />
            {postedLabel}
          </Badge>
        )}
      </div>

      {/* ── Salary ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <PoundSterling className="size-4 shrink-0" />
        <span>
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </span>
      </div>

      {/* ── Match strength bar (score % removed — badge above is the source) */}
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Match strength</span>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              scoreBarColor(match.match_score)
            )}
            style={{ width: `${match.match_score}%` }}
          />
        </div>
      </div>

      {/* ── Skills ──────────────────────────────────────────────────────── */}
      {(match.matched_skills.length > 0 || match.missing_skills.length > 0) && (
        <div className="space-y-2">
          {match.matched_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleMatched.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"
                >
                  {skill}
                </span>
              ))}
              {extraMatched > 0 && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  +{extraMatched} more
                </span>
              )}
            </div>
          )}
          {match.missing_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleMissing.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200"
                >
                  {skill}
                </span>
              ))}
              {extraMissing > 0 && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  +{extraMissing} missing
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-1 mt-auto">
        <Select
          value={status}
          onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
        >
          <SelectTrigger
            className={cn(
              "h-9 text-xs font-medium border rounded-lg px-3 flex-1",
              statusCfg.triggerClass
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ENTRIES.map(([value, cfg]) => {
              const ItemIcon = cfg.Icon;
              return (
                <SelectItem
                  key={value}
                  value={value}
                  textValue={cfg.label}
                  className="text-xs"
                >
                  <div className="flex items-center gap-2">
                    <ItemIcon
                      className={cn("size-3.5 shrink-0", cfg.iconClass)}
                    />
                    {cfg.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Apply Now (first visit) → View Job (already actioned) */}
        {job.external_url &&
          (status === "not_applied" ? (
            <Button
              variant="default"
              size="sm"
              className="shrink-0"
              onClick={() => {
                window.open(job.external_url!, "_blank", "noopener,noreferrer");
                handleStatusChange("applied");
              }}
            >
              <ExternalLink className="size-3.5 mr-1.5" />
              Apply Now
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <a
                href={job.external_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3.5 mr-1.5" />
                View Job
              </a>
            </Button>
          ))}
      </div>
    </div>
  );
}

export const JobCard = memo(JobCardInner);
