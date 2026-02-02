"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle } from "lucide-react";

interface ResumeUploadProps {
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

export default function ResumeUpload({ 
  className, 
  appState, 
  fileName, 
  inputRef, 
  error, 
  onFileChange, 
  onUploadClick,
  onReviewClick,
  statusMessage 
}: ResumeUploadProps) {
  if (appState === "PROCESSING") {
    return (
      <section className={className}>
        <div className="border rounded-xl p-4 flex items-center gap-3 bg-muted/20">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Analysing Your Resume</p>
            <p className="text-xs text-muted-foreground">Please wait while we extract your information...</p>
          </div>
        </div>
      </section>
    );
  }

  if (appState === "DONE") {
    return (
      <section className={className}>
        <div className="border rounded-xl p-4 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-4 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">Resume processed successfully!</p>
              <p className="text-xs text-muted-foreground">Ready for review and editing</p>
            </div>
          </div>
          {onReviewClick && (
            <Button size="sm" onClick={onReviewClick}>
              Review CV
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={onUploadClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onUploadClick(); } }}
        className="border rounded-xl p-6 sm:p-8 grid place-items-center text-center hover:bg-muted/40 transition-colors cursor-pointer"
        aria-label="Upload resume"
      >
        <Upload className="size-6 text-muted-foreground" aria-hidden />
        <p className="mt-3 font-medium">{fileName ? fileName : "Drop a PDF/DOCX here or click to upload"}</p>
        <p className="text-sm text-muted-foreground">We accept PDF or DOCX up to 5MB.</p>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <Input
          ref={inputRef}
          id="resume-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          onChange={onFileChange}
        />
      </div>
    </section>
  );
}