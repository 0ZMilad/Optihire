"use client";

import {
  Building2,
  Clock,
  ExternalLink,
  MapPin,
  PoundSterling,
} from "lucide-react";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApplicationStatus, JobMatch } from "@/lib/job-types";
import {
  getScoreBadgeClass,
  getScoreBarClass,
  getScoreDescription,
  getScoreTierLabel,
} from "@/lib/score-utils";
import { cn } from "@/lib/utils";
import { JobStatusSelect } from "./job-status-select";

interface JobCardProps {
  match: JobMatch;
  onStatusChange: (
    matchId: string,
    status: ApplicationStatus
  ) => void | Promise<void>;
}

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

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      maximumFractionDigits: 0,
      notation: value >= 10_000 ? "compact" : "standard",
    }).format(value);
  } catch {
    return `${currency || ""} ${value.toLocaleString("en-GB")}`.trim();
  }
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string
) {
  if (min == null && max == null) return "Not disclosed";
  if (min != null && max != null) {
    return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
  }
  if (min != null) return `From ${formatCurrency(min, currency)}`;
  return `Up to ${formatCurrency(max as number, currency)}`;
}

function formatPostedDate(value: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function JobCardInner({ match, onStatusChange }: JobCardProps) {
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
    () => formatPostedDate(job.posted_date),
    [job.posted_date]
  );

  const scoreLabel = `${getScoreTierLabel(match.match_score)} match, ${match.match_score} percent`;

  return (
    <article className="flex min-h-full flex-col gap-4 rounded-lg border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Building2 className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {job.company_name}
            </p>
            <h3 className="text-base font-semibold leading-snug">
              {job.job_title}
            </h3>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold",
            getScoreBadgeClass(match.match_score)
          )}
          title={scoreLabel}
        >
          {match.match_score}% {getScoreTierLabel(match.match_score)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.location && (
          <Badge variant="secondary" className="gap-1 font-normal">
            <MapPin className="size-3" aria-hidden />
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
            <Clock className="size-3" aria-hidden />
            {postedLabel}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <PoundSterling className="size-4 shrink-0" aria-hidden />
        <span>
          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Match strength</span>
          <span className="font-medium">
            {getScoreDescription(match.match_score)}
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          aria-hidden
        >
          <div
            className={cn(
              "h-full rounded-full transition-all",
              getScoreBarClass(match.match_score)
            )}
            style={{ width: `${match.match_score}%` }}
          />
        </div>
      </div>

      {(match.matched_skills.length > 0 || match.missing_skills.length > 0) && (
        <div className="space-y-2">
          {match.matched_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleMatched.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-md bg-score-strong/10 px-2 py-0.5 text-xs font-medium text-score-strong ring-1 ring-inset ring-score-strong/20"
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
                  className="inline-flex items-center rounded-md bg-score-weak/10 px-2 py-0.5 text-xs font-medium text-score-weak ring-1 ring-inset ring-score-weak/20"
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

      <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
        <JobStatusSelect
          status={match.application_status}
          onChange={(status) => onStatusChange(match.id, status)}
          ariaLabel={`Application status for ${job.job_title} at ${job.company_name}`}
          className="w-full sm:flex-1"
        />

        {job.external_url &&
          (match.application_status === "not_applied" ? (
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => {
                if (!job.external_url) return;
                window.open(job.external_url, "_blank", "noopener,noreferrer");
                void onStatusChange(match.id, "applied");
              }}
            >
              <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
              Apply now
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <a
                href={job.external_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${job.job_title} at ${job.company_name}`}
              >
                <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
                View job
              </a>
            </Button>
          ))}
      </div>
    </article>
  );
}

export const JobCard = memo(JobCardInner);
