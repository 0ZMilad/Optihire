import { ExternalLink, MapPin } from "lucide-react";
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

interface JobReviewListProps {
  matches: JobMatch[];
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

function formatPostedDate(value: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function getMetaLine(match: JobMatch) {
  const { job_listing: job } = match;
  const pieces = [
    job.location,
    job.remote_type ? REMOTE_TYPE_LABELS[job.remote_type] : null,
    job.job_type ? JOB_TYPE_LABELS[job.job_type] : null,
  ].filter(Boolean);

  return pieces.join(" / ");
}

export function JobReviewList({ matches, onStatusChange }: JobReviewListProps) {
  return (
    <section
      className="overflow-hidden rounded-lg border bg-card shadow-xs"
      aria-label="Compact job review list"
    >
      <div className="hidden border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[minmax(260px,1.4fr)_minmax(170px,0.7fr)_minmax(150px,0.6fr)_minmax(180px,0.7fr)_auto] md:gap-4">
        <span>Role</span>
        <span>Match</span>
        <span>Skills</span>
        <span>Status</span>
        <span className="text-right">Action</span>
      </div>

      <ul className="divide-y">
        {matches.map((match) => {
          const { job_listing: job } = match;
          const postedLabel = formatPostedDate(job.posted_date);
          const metaLine = getMetaLine(match);

          return (
            <li
              key={match.id}
              className="grid gap-4 p-4 md:grid-cols-[minmax(260px,1.4fr)_minmax(170px,0.7fr)_minmax(150px,0.6fr)_minmax(180px,0.7fr)_auto] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {job.company_name}
                </p>
                <h3 className="mt-1 text-sm font-semibold leading-snug">
                  {job.job_title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {metaLine && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" aria-hidden />
                      {metaLine}
                    </span>
                  )}
                  {postedLabel && <span>Posted {postedLabel}</span>}
                </div>
              </div>

              <div>
                <div
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
                    getScoreBadgeClass(match.match_score)
                  )}
                  title={`${getScoreTierLabel(match.match_score)} match, ${match.match_score} percent`}
                >
                  {match.match_score}% {getScoreTierLabel(match.match_score)}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      getScoreBarClass(match.match_score)
                    )}
                    style={{ width: `${match.match_score}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getScoreDescription(match.match_score)}
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                <span className="block">
                  <strong className="font-semibold text-foreground">
                    {match.matched_skills.length}
                  </strong>{" "}
                  matched
                </span>
                <span className="block">
                  <strong className="font-semibold text-foreground">
                    {match.missing_skills.length}
                  </strong>{" "}
                  missing
                </span>
              </div>

              <JobStatusSelect
                status={match.application_status}
                onChange={(status) => onStatusChange(match.id, status)}
                ariaLabel={`Application status for ${job.job_title} at ${job.company_name}`}
                className="w-full md:w-44"
              />

              <div className="flex justify-start md:justify-end">
                {job.external_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={job.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${job.job_title} at ${job.company_name}`}
                    >
                      <ExternalLink className="mr-2 size-3.5" aria-hidden />
                      Open
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No link available
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
