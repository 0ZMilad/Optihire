/**
 * Jobs service — frontend API layer for job matches.
 *
 * GET  /api/v1/resumes/{resumeId}/job-matches
 * PATCH /api/v1/jobs/matches/{matchId}/status { status: ApplicationStatus }
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

// ─── Update application status ───────────────────────────────────────────────

export async function updateApplicationStatus(
  matchId: string,
  status: ApplicationStatus
): Promise<void> {
  await apiClient.patch(`/api/v1/jobs/matches/${encodeURIComponent(matchId)}/status`, {
    status,
  });
}
