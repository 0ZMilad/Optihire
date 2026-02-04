"use client";

import { useState } from "react";
import { Main } from "@/components/main";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { EnhancedResumeBuilderUI } from "@/components/resume";

export default function ResumesPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const resumes = []; // Placeholder for resumes list

  return (
    <DashboardLayout>
      <Main>
        <div className="mx-auto max-w-7xl space-y-8 px-4">
          {showBuilder ? (
            <EnhancedResumeBuilderUI onBack={() => setShowBuilder(false)} />
          ) : (
            <>
              {/* Header */}
              <div>
                <h1 className="text-2xl font-semibold">My Resumes</h1>
                <p className="text-sm text-muted-foreground">Manage and organize your resumes</p>
              </div>

              {/* Resumes Grid */}
              {resumes.length === 0 ? (
                <div className="border rounded-xl p-12 text-center">
                  <FileText className="mx-auto size-12 text-muted-foreground mb-4" />
                  <h2 className="text-lg font-semibold mb-2">No resumes yet</h2>
                  <p className="text-muted-foreground mb-6">Create your first resume to get started</p>
                  <Button onClick={() => setShowBuilder(true)}>
                    Create Resume
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Resume cards will go here */}
                </div>
              )}
            </>
          )}
        </div>
      </Main>
    </DashboardLayout>
  );
}
