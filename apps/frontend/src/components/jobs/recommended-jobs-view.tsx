"use client";

import type { AxiosError } from "axios";
import {
  Grid3X3,
  List,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import type { ApplicationStatus, JobMatch } from "@/lib/job-types";
import { APPLICATION_STATUS_META } from "@/lib/status-styles";
import { getJobMatches, updateApplicationStatus } from "@/middle-service/jobs";
import { getActiveResume } from "@/middle-service/resumes";
import { JobCard } from "./job-card";
import { JobReviewList } from "./job-review-list";
import { JobsSummary } from "./jobs-summary";

async function fetchRecommendedJobs(): Promise<JobMatch[]> {
  const resume = await getActiveResume();
  return getJobMatches(resume.id);
}

type RemoteFilter = "all" | "remote" | "hybrid" | "onsite";
type JobTypeFilter =
  | "all"
  | "full_time"
  | "part_time"
  | "contract"
  | "internship";
type ScoreFilter = "all" | "80" | "60" | "40";
type StatusFilter = "all" | ApplicationStatus;
type ViewMode = "review" | "cards";

interface Filters {
  search: string;
  remoteType: RemoteFilter;
  jobType: JobTypeFilter;
  minScore: ScoreFilter;
  status: StatusFilter;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  remoteType: "all",
  jobType: "all",
  minScore: "all",
  status: "all",
};

const REMOTE_FILTER_LABELS: Record<RemoteFilter, string> = {
  all: "All work types",
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

const JOB_TYPE_FILTER_LABELS: Record<JobTypeFilter, string> = {
  all: "All job types",
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const SCORE_FILTER_LABELS: Record<ScoreFilter, string> = {
  all: "Any match score",
  "80": "80%+ strong",
  "60": "60%+ good",
  "40": "40%+ fair",
};

function hasActiveFilters(f: Filters) {
  return (
    f.search.trim() !== "" ||
    f.remoteType !== "all" ||
    f.jobType !== "all" ||
    f.minScore !== "all" ||
    f.status !== "all"
  );
}

function getFilterLabels(filters: Filters) {
  const labels: string[] = [];
  if (filters.search.trim()) labels.push(`Search: ${filters.search.trim()}`);
  if (filters.remoteType !== "all") {
    labels.push(`Work: ${REMOTE_FILTER_LABELS[filters.remoteType]}`);
  }
  if (filters.jobType !== "all") {
    labels.push(`Type: ${JOB_TYPE_FILTER_LABELS[filters.jobType]}`);
  }
  if (filters.minScore !== "all") {
    labels.push(`Score: ${SCORE_FILTER_LABELS[filters.minScore]}`);
  }
  if (filters.status !== "all") {
    labels.push(`Status: ${APPLICATION_STATUS_META[filters.status].label}`);
  }
  return labels;
}

export function RecommendedJobsView() {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>("review");
  const debouncedSearch = useDebounce(filters.search, 200);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchRecommendedJobs();
      setJobs(data);
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      const detail = error.response?.data?.detail;

      if (
        error.response?.status === 404 &&
        detail?.includes("not been analyzed")
      ) {
        setError("Run an ATS audit on your resume first to see job matches.");
      } else if (error.response?.status === 404) {
        setError("No active resume found. Upload and parse a resume first.");
      } else {
        setError(
          detail ??
            error.message ??
            "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const retry = useCallback(() => {
    void loadJobs();
  }, [loadJobs]);

  const filteredJobs = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    return jobs.filter((match) => {
      const { job_listing: job } = match;

      if (
        q &&
        !job.job_title.toLowerCase().includes(q) &&
        !job.company_name.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (
        filters.remoteType !== "all" &&
        job.remote_type !== filters.remoteType
      ) {
        return false;
      }
      if (filters.jobType !== "all" && job.job_type !== filters.jobType) {
        return false;
      }
      if (
        filters.minScore !== "all" &&
        match.match_score < Number.parseInt(filters.minScore, 10)
      ) {
        return false;
      }
      if (
        filters.status !== "all" &&
        match.application_status !== filters.status
      ) {
        return false;
      }

      return true;
    });
  }, [
    jobs,
    debouncedSearch,
    filters.remoteType,
    filters.jobType,
    filters.minScore,
    filters.status,
  ]);

  const effectiveFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );
  const activeFilters = hasActiveFilters(effectiveFilters);
  const activeFilterLabels = getFilterLabels(effectiveFilters);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleStatusChange = useCallback(
    async (matchId: string, nextStatus: ApplicationStatus) => {
      const current = jobs.find((match) => match.id === matchId);
      if (!current || current.application_status === nextStatus) return;

      const previousStatus = current.application_status;
      setJobs((prev) =>
        prev.map((match) =>
          match.id === matchId
            ? { ...match, application_status: nextStatus }
            : match
        )
      );

      try {
        await updateApplicationStatus(matchId, nextStatus);
        toast.success(`Status: ${APPLICATION_STATUS_META[nextStatus].label}`, {
          description: `${current.job_listing.job_title} at ${current.job_listing.company_name}`,
        });
      } catch {
        setJobs((prev) =>
          prev.map((match) =>
            match.id === matchId
              ? { ...match, application_status: previousStatus }
              : match
          )
        );
        toast.error("Failed to update application status. Please try again.");
      }
    },
    [jobs]
  );

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Review workspace"
        title="Job Matches"
        description="Review curated roles from your active resume, compare match strength, and track each application status."
        actions={
          !loading &&
          !error &&
          jobs.length > 0 && (
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw className="mr-2 size-3.5" aria-hidden />
              Refresh
            </Button>
          )
        }
      />

      {loading ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState
          title="Job matches need setup"
          description={error}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" onClick={retry}>
                <RefreshCw className="mr-2 size-3.5" aria-hidden />
                Try again
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/audit">Run ATS audit</Link>
              </Button>
            </div>
          }
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-5" aria-hidden />}
          title="No job matches yet"
          description="OptiHire did not return matches for the active resume. Run an ATS audit or refresh after your resume is ready."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" onClick={retry}>
                <RefreshCw className="mr-2 size-3.5" aria-hidden />
                Refresh
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/audit">Run ATS audit</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <JobsSummary matches={jobs} filteredCount={filteredJobs.length} />

          <section className="space-y-4 rounded-lg border bg-card p-4 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <SlidersHorizontal className="size-4" aria-hidden />
                Filter and review
              </div>
              <fieldset className="flex w-full rounded-lg border bg-muted/20 p-1 sm:w-auto">
                <legend className="sr-only">Choose job match view</legend>
                <Button
                  type="button"
                  variant={viewMode === "review" ? "secondary" : "ghost"}
                  size="sm"
                  className="flex-1 gap-2 sm:flex-none"
                  aria-pressed={viewMode === "review"}
                  onClick={() => setViewMode("review")}
                >
                  <List className="size-3.5" aria-hidden />
                  Review list
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="sm"
                  className="flex-1 gap-2 sm:flex-none"
                  aria-pressed={viewMode === "cards"}
                  onClick={() => setViewMode("cards")}
                >
                  <Grid3X3 className="size-3.5" aria-hidden />
                  Cards
                </Button>
              </fieldset>
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(150px,auto))]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title or company..."
                  value={filters.search}
                  onChange={(e) => setFilter("search", e.target.value)}
                  className="pl-9"
                  aria-label="Search job matches"
                />
              </div>

              <Select
                value={filters.remoteType}
                onValueChange={(value) =>
                  setFilter("remoteType", value as RemoteFilter)
                }
              >
                <SelectTrigger aria-label="Filter by work type">
                  <SelectValue placeholder="Work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All work types</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.jobType}
                onValueChange={(value) =>
                  setFilter("jobType", value as JobTypeFilter)
                }
              >
                <SelectTrigger aria-label="Filter by job type">
                  <SelectValue placeholder="Job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All job types</SelectItem>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.minScore}
                onValueChange={(value) =>
                  setFilter("minScore", value as ScoreFilter)
                }
              >
                <SelectTrigger aria-label="Filter by minimum score">
                  <SelectValue placeholder="Min score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any match score</SelectItem>
                  <SelectItem value="80">80%+ strong</SelectItem>
                  <SelectItem value="60">60%+ good</SelectItem>
                  <SelectItem value="40">40%+ fair</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilter("status", value as StatusFilter)
                }
              >
                <SelectTrigger aria-label="Filter by application status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(APPLICATION_STATUS_META).map(
                    ([value, meta]) => (
                      <SelectItem key={value} value={value}>
                        {meta.label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="text-sm text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filteredJobs.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {jobs.length}
                </span>{" "}
                matches
              </p>

              {activeFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-fit gap-1.5"
                >
                  <X className="size-3.5" aria-hidden />
                  Clear filters
                </Button>
              )}
            </div>

            {activeFilterLabels.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Active filters">
                {activeFilterLabels.map((label) => (
                  <li
                    key={label}
                    className="rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {filteredJobs.length === 0 ? (
            <EmptyState
              title="No matches fit these filters"
              description="Clear or loosen the filters to bring more curated roles back into the review queue."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : viewMode === "review" ? (
            <JobReviewList
              matches={filteredJobs}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((match) => (
                <JobCard
                  key={match.id}
                  match={match}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
