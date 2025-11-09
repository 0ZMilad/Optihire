"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="container py-6">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back! Here's an overview of your applications.
              </p>
            </div>
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
                  Upload resume to analyze
                </p>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
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
                  Analyze Resume
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

          {/* Getting Started Section */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                  1
                </div>
                <h4 className="font-semibold">Upload Your Resume</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your resume to get started with ATS optimization
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                  2
                </div>
                <h4 className="font-semibold">Analyze & Optimize</h4>
                <p className="text-sm text-muted-foreground">
                  Get detailed feedback and suggestions to improve your resume
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                  3
                </div>
                <h4 className="font-semibold">Apply with Confidence</h4>
                <p className="text-sm text-muted-foreground">
                  Apply to jobs knowing your resume is ATS-optimized
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
