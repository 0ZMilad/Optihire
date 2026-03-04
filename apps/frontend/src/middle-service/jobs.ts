/**
 * Jobs service — frontend API layer for job matches and saved jobs.
 *
 * Currently uses a simulated delay so the UI feedback loop works end-to-end.
 * Replace each function body with `apiClient.patch/post(...)` once the backend
 * endpoints are implemented.
 *
 * Expected future endpoints:
 *   PATCH /api/v1/jobs/matches/{matchId}/save   { is_saved: boolean }
 *   PATCH /api/v1/jobs/matches/{matchId}/status { status: ApplicationStatus }
 */

import type { ApplicationStatus } from "@/lib/mock-jobs";

// import { apiClient } from "./client";  ← uncomment when backend is ready

// ─── Save / unsave a job ─────────────────────────────────────────────────────

export async function saveJob(matchId: string, saved: boolean): Promise<void> {
  // TODO: replace with real call:
  // await apiClient.patch(`/api/v1/jobs/matches/${matchId}/save`, { is_saved: saved });
  return new Promise((resolve) => setTimeout(resolve, 400));
}

// ─── Update application status ───────────────────────────────────────────────

export async function updateApplicationStatus(
  matchId: string,
  status: ApplicationStatus
): Promise<void> {
  // TODO: replace with real call:
  // await apiClient.patch(`/api/v1/jobs/matches/${matchId}/status`, { status });
  return new Promise((resolve) => setTimeout(resolve, 400));
}
