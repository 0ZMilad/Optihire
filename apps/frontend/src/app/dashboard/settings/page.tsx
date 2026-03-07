"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { Main } from "@/components/main";
import { SettingsPageUI } from "@/components/settings/settings-page-ui";

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader>
        <h2 className="text-lg font-semibold">Settings</h2>
      </DashboardHeader>
      <Main>
        <SettingsPageUI />
      </Main>
    </>
  );
}
