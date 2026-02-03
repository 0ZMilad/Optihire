"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import ResumeEditor from "./ResumeEditor";
import ResumeSidebar from "./ResumeSidebar";
import type { ResumeData } from "./types";

interface ResumeBuilderUIProps {
  className?: string;
  onBack?: () => void;
}

export default function ResumeBuilderUI({ className, onBack }: ResumeBuilderUIProps) {
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: "",
    title: "",
    summary: "",
    experience: "",
    skills: "",
  });

  const updateResumeData = useCallback((field: keyof ResumeData, value: string) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className={cn("mx-auto max-w-6xl", className)}>
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 size-4" />
          Back to Resumes
        </Button>
      )}
      
      <h1 className="text-2xl font-semibold">Resume Builder</h1>
      <p className="text-sm text-muted-foreground">Tabbed sections with live preview.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ResumeEditor 
          resumeData={resumeData}
          onUpdateData={updateResumeData}
          className="order-2 lg:order-1"
        />
        
        <ResumeSidebar 
          resumeData={resumeData}
          className="order-1 lg:order-2"
        />
      </div>
    </div>
  );
}
