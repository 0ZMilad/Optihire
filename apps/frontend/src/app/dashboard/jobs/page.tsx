"use client";

import dynamic from "next/dynamic";
import { DashboardHeader } from "@/components/dashboard-header";
import { Main } from "@/components/main";
import { LoadingState } from "@/components/shared/loading-state";

const RecommendedJobsView = dynamic(
  () =>
    import("@/components/jobs/recommended-jobs-view").then(
      (module) => module.RecommendedJobsView
    ),
  {
    ssr: false,
    loading: () => <LoadingState rows={4} />,
  }
);

export default function JobsPage() {
  return (
    <>
      <DashboardHeader>
        <h2 className="text-lg font-semibold">Job Matches</h2>
      </DashboardHeader>
      <Main>
        <RecommendedJobsView />
      </Main>
    </>
  );
}
