"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { Main } from "@/components/main";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardHeader>
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Upload Resume
            </Button>
          </div>
        </div>
      </DashboardHeader>

      <Main>
        <div className="space-y-6">
          {/* Welcome Message */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here's an overview of your applications.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  Start applying to jobs
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Jobs
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  Jobs you're tracking
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Interview Rate
                </p>
                <p className="text-3xl font-bold">0%</p>
                <p className="text-xs text-muted-foreground">
                  Applications to interviews
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  ATS Score
                </p>
                <p className="text-3xl font-bold">--</p>
                <p className="text-xs text-muted-foreground">
                  Upload resume to analyse
                </p>
              </div>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  Upload Resume
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Search Jobs
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  Analyse Resume
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity yet. Start by uploading your resume!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Main>
    </DashboardLayout>
  );
}
