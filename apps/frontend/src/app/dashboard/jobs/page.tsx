"use client";

import dynamic from "next/dynamic";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Main } from "@/components/main";
import { Skeleton } from "@/components/ui/skeleton";

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
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[320px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    ),
  }
);

export default function JobsPage() {
  return (
    <DashboardLayout>
      <DashboardHeader>
        <h2 className="text-lg font-semibold">Recommended Jobs</h2>
      </DashboardHeader>
      <Main>
        <RecommendedJobsView />
      </Main>
    </DashboardLayout>
  );
}
