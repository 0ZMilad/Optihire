"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Main } from "@/components/main";
import { SettingsPageUI } from "@/components/settings/settings-page-ui";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <DashboardHeader>
        <h2 className="text-lg font-semibold">Settings</h2>
      </DashboardHeader>
      <Main>
        <SettingsPageUI />
      </Main>
    </DashboardLayout>
  );
}
