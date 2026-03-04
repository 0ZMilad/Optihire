"use client";

import { useState } from "react";
import {
  MapPin,
  DollarSign,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JobMatch } from "@/lib/mock-jobs";

// ─── Helpers ────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-700";
  if (score >= 50) return "text-amber-700";
  return "text-red-700";
}

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

function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return "Not disclosed";
  const fmt = (n: number) =>
    n >= 1000 ? `${currency === "USD" ? "$" : ""}${Math.round(n / 1000)}k` : `${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${currency}`;
  if (min) return `From ${fmt(min)} ${currency}`;
  return `Up to ${fmt(max!)} ${currency}`;
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
};

const SKILLS_VISIBLE = 5;

// ─── Component ──────────────────────────────────────────────────────────────

interface JobCardProps {
  match: JobMatch;
}

export function JobCard({ match }: JobCardProps) {
  const [saved, setSaved] = useState(match.is_saved);
  const { job_listing: job } = match;

  const visibleMatched = match.matched_skills.slice(0, SKILLS_VISIBLE);
  const extraMatched = match.matched_skills.length - SKILLS_VISIBLE;
  const visibleMissing = match.missing_skills.slice(0, SKILLS_VISIBLE);
  const extraMissing = match.missing_skills.length - SKILLS_VISIBLE;

  const postedLabel = job.posted_date
    ? new Date(job.posted_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="rounded-xl border bg-card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* ── Top row: company + score badge ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Company icon */}
          <div className="flex items-center justify-center size-10 rounded-lg bg-muted text-muted-foreground shrink-0">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium truncate">
              {job.company_name}
            </p>
            <h3 className="text-base font-semibold leading-snug">{job.job_title}</h3>
          </div>
        </div>

        {/* Match score badge */}
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
        <DollarSign className="size-4 shrink-0" />
        <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
      </div>

      {/* ── Match score bar ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Match strength</span>
          <span className={cn("font-semibold", scoreColor(match.match_score))}>
            {match.match_score}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", scoreBarColor(match.match_score))}
            style={{ width: `${match.match_score}%` }}
          />
        </div>
      </div>

      {/* ── Skills ──────────────────────────────────────────────────────── */}
      {(match.matched_skills.length > 0 || match.missing_skills.length > 0) && (
        <div className="space-y-2">
          {/* Matched */}
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

          {/* Missing */}
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
        {job.external_url ? (
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={job.external_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 mr-1.5" />
              Apply Now
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="flex-1">
            No link available
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-9 shrink-0", saved && "text-primary")}
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? "Unsave job" : "Save job"}
        >
          {saved ? (
            <BookmarkCheck className="size-4" />
          ) : (
            <Bookmark className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
