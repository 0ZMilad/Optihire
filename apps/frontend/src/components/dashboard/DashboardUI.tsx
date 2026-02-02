"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import QuickStatsGrid from "./QuickStatsGrid";
import ResumeUpload from "./ResumeUpload";
import QuickActions from "./QuickActions";
import DashboardWidgets from "./DashboardWidgets";

interface DashboardUIProps {
  className?: string;
  appState: string;
  fileName: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadClick: () => void;
  onReviewClick?: () => void;
  statusMessage?: string;
}

export default function DashboardUI({ 
  className, 
  appState, 
  fileName, 
  inputRef, 
  error, 
  onFileChange, 
  onUploadClick,
  onReviewClick,
  statusMessage 
}: DashboardUIProps) {
  return (
    <div className={`mx-auto max-w-7xl space-y-8 px-4 ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Upload your resume or build one from scratch.</p>
        </div>
        <Button asChild>
          <Link href="/resume">Open Builder</Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <QuickStatsGrid className="mt-8" />

      {/* Resume Upload */}
      <ResumeUpload 
        className="mt-8"
        appState={appState}
        fileName={fileName}
        inputRef={inputRef}
        error={error}
        onFileChange={onFileChange}
        onReviewClick={onReviewClick}
        onUploadClick={onUploadClick}
        statusMessage={statusMessage}
      />

      {/* Quick Actions */}
      <QuickActions className="mt-10" />

      {/* Interactive Widgets */}
      <DashboardWidgets className="mt-10" />
    </div>
  );
}