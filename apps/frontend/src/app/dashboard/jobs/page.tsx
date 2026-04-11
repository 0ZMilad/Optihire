"use client";

import dynamic from "next/dynamic";
import { DashboardHeader } from "@/components/dashboard-header";
import { Main } from "@/components/main";
import { Skeleton } from "@/components/ui/skeleton";

const JOB_SKELETON_KEYS = Array.from(
  { length: 6 },
  (_, index) => `job-skeleton-${index}`
);

// Lazy-load the view — avoids SSR issues with client-only state
const RecommendedJobsView = dynamic(
  () =>
    import("@/components/jobs/recommended-jobs-view").then(
      (m) => m.RecommendedJobsView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {JOB_SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-[320px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    ),
  }
);

export default function JobsPage() {
  return (
    <>
      <DashboardHeader>
        <h2 className="text-lg font-semibold">Recommended Jobs</h2>
      </DashboardHeader>
      <Main>
        <RecommendedJobsView />
      </Main>
    </>
  );
}
