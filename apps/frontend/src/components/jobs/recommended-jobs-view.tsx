"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Sparkles,
  Search,
  X,
  AlertCircle,
  BriefcaseIcon,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { AxiosError } from "axios";
import { JobCard } from "./job-card";
import type { JobMatch } from "@/lib/job-types";
import { getActiveResume } from "@/middle-service/resumes";
import { getJobMatches } from "@/middle-service/jobs";

// ─── Real API fetch ──────────────────────────────────────────────────────────

async function fetchRecommendedJobs(): Promise<JobMatch[]> {
  const resume = await getActiveResume();
  return getJobMatches(resume.id);
}

// ─── Filter state type ──────────────────────────────────────────────────────

type RemoteFilter = "all" | "remote" | "hybrid" | "onsite";
type JobTypeFilter = "all" | "full_time" | "part_time" | "contract" | "internship";
type ScoreFilter = "all" | "80" | "60" | "40";

interface Filters {
  search: string;
  remoteType: RemoteFilter;
  jobType: JobTypeFilter;
  minScore: ScoreFilter;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  remoteType: "all",
  jobType: "all",
  minScore: "all",
};

function hasActiveFilters(f: Filters) {
  return (
    f.search.trim() !== "" ||
    f.remoteType !== "all" ||
    f.jobType !== "all" ||
    f.minScore !== "all"
  );
}

// ─── Skeleton grid ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[320px] w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── Error state ─────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border p-12 text-center space-y-4">
      <div className="flex justify-center">
        <span className="flex items-center justify-center size-12 rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </span>
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Failed to load job matches</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{message}</p>
      </div>
      <Button onClick={onRetry} variant="outline" size="sm">
        <RefreshCw className="size-3.5 mr-2" />
        Try again
      </Button>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border p-12 text-center space-y-3">
      <div className="flex justify-center">
        <span className="flex items-center justify-center size-12 rounded-full bg-muted">
          <BriefcaseIcon className="size-6 text-muted-foreground" />
        </span>
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">No matching jobs</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {hasFilters
            ? "Try adjusting your filters to see more results."
            : "No jobs matched your resume yet. Check back soon as new listings are added daily."}
        </p>
      </div>
    </div>
  );
}

// ─── Stats bar ───────────────────────────────────────────────────────────────

function StatsBar({ total, filtered }: { total: number; filtered: number }) {
  return (
    <p className="text-sm text-muted-foreground">
      Showing{" "}
      <span className="font-medium text-foreground">{filtered}</span>
      {filtered !== total && (
        <>
          {" "}
          of <span className="font-medium text-foreground">{total}</span>
        </>
      )}{" "}
      {filtered === 1 ? "job" : "jobs"}
    </p>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function RecommendedJobsView() {
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCounter, setFetchCounter] = useState(0);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  // Debounce the search string so the filter memo doesn't run on every keystroke.
  const debouncedSearch = useDebounce(filters.search, 200);

  // Fetch (or re-fetch on retry)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRecommendedJobs()
      .then((data) => {
        if (!cancelled) {
          setJobs(data);
          setLoading(false);
        }
      })
      .catch((err: AxiosError<{ detail?: string }>) => {
        if (!cancelled) {
          const detail = err.response?.data?.detail;
          let message: string;
          if (err.response?.status === 404 && detail?.includes("not been analyzed")) {
            message = "Run an analysis on your resume first to see job matches.";
          } else if (err.response?.status === 404) {
            message = "No resume found. Upload and parse a resume first.";
          } else {
            message = detail ?? err.message ?? "An unexpected error occurred. Please try again.";
          }
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchCounter]);

  const retry = () => setFetchCounter((n) => n + 1);

  // Client-side filtering — search uses the debounced value to avoid
  // running the filter on every keystroke.
  const filteredJobs = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return jobs.filter((m) => {
      const { job_listing: j } = m;
      if (q && !j.job_title.toLowerCase().includes(q) && !j.company_name.toLowerCase().includes(q))
        return false;
      if (filters.remoteType !== "all" && j.remote_type !== filters.remoteType) return false;
      if (filters.jobType !== "all" && j.job_type !== filters.jobType) return false;
      if (filters.minScore !== "all" && m.match_score < parseInt(filters.minScore, 10))
        return false;
      return true;
    });
  }, [jobs, debouncedSearch, filters.remoteType, filters.jobType, filters.minScore]);

  const activeFilters = hasActiveFilters({ ...filters, search: debouncedSearch });

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="space-y-8">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Recommended Jobs</h1>
            <span className="flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Matched to your most recent resume analysis
          </p>
        </div>
        {!loading && !error && jobs.length > 0 && (
          <Button variant="outline" size="sm" onClick={retry} className="shrink-0">
            <RefreshCw className="size-3.5 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────── */}
      {!loading && !error && jobs.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            Filter results
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by title or company…"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Remote type */}
            <Select
              value={filters.remoteType}
              onValueChange={(v) => setFilter("remoteType", v as RemoteFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Work type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All work types</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>

            {/* Job type */}
            <Select
              value={filters.jobType}
              onValueChange={(v) => setFilter("jobType", v as JobTypeFilter)}
            >
              <SelectTrigger className="w-[140px]">
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

            {/* Min match score */}
            <Select
              value={filters.minScore}
              onValueChange={(v) => setFilter("minScore", v as ScoreFilter)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Min match score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any match score</SelectItem>
                <SelectItem value="80">80%+ (Strong)</SelectItem>
                <SelectItem value="60">60%+ (Good)</SelectItem>
                <SelectItem value="40">40%+ (Fair)</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear filters */}
            {activeFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                <X className="size-3.5" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────── */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filteredJobs.length === 0 ? (
        <EmptyState hasFilters={activeFilters} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatsBar total={jobs.length} filtered={filteredJobs.length} />
            <Separator className="hidden" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((match) => (
              <JobCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
