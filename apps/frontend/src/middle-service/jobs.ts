/**
 * Jobs service — frontend API layer for job matches and saved jobs.
 *
 * getJobMatches is fully wired to the real backend endpoint.
 *
 * saveJob / updateApplicationStatus still use a simulated delay so the UI
 * feedback loop works end-to-end. Replace each body with a real call once the
 * backend endpoints are implemented:
 *   PATCH /api/v1/jobs/matches/{matchId}/save   { is_saved: boolean }
 *   PATCH /api/v1/jobs/matches/{matchId}/status { status: ApplicationStatus }
 */

import type { ApplicationStatus, JobMatch } from "@/lib/mock-jobs";
import { apiClient } from "./client";

// ─── Fetch curated job matches for a resume ──────────────────────────────────

export async function getJobMatches(resumeId: string): Promise<JobMatch[]> {
  const response = await apiClient.get<JobMatch[]>(
    `/api/v1/resumes/${resumeId}/job-matches`
  );
  return response.data;
}

// ─── Save / unsave a job ─────────────────────────────────────────────────────

export async function saveJob(matchId: string, saved: boolean): Promise<void> {
  // TODO: replace with real call once the save endpoint is implemented:
  // await apiClient.patch(`/api/v1/jobs/matches/${matchId}/save`, { is_saved: saved });
  return new Promise((resolve) => setTimeout(resolve, 400));
}

// ─── Update application status ───────────────────────────────────────────────

export async function updateApplicationStatus(
  matchId: string,
  status: ApplicationStatus
): Promise<void> {
  // TODO: replace with real call once the status endpoint is implemented:
  // await apiClient.patch(`/api/v1/jobs/matches/${matchId}/status`, { status });
  return new Promise((resolve) => setTimeout(resolve, 400));
}
