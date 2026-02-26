"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeListItem } from "@/middle-service/types";

const MIN_WORDS = 50;
const MAX_CHARS = 10000;

interface AuditInputViewProps {
  resumes: ResumeListItem[];
  loading: boolean;
  onSubmit: (resumeId: string, jobDescription: string) => void;
}

export function AuditInputView({
  resumes,
  loading,
  onSubmit,
}: AuditInputViewProps) {
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const wordCount = useMemo(() => {
    const trimmed = jobDescription.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [jobDescription]);

  const charCount = jobDescription.length;
  const isValid = wordCount >= MIN_WORDS && charCount <= MAX_CHARS && selectedResumeId !== "";
  const progressPercent = Math.min((wordCount / MIN_WORDS) * 100, 100);

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJobDescription(text);
    } catch {}
  }, []);

  return (
    <div className="mx-auto w-full max-w-[800px] space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">New Application Audit</h1>
        <p className="text-muted-foreground text-sm">
          Paste a job description to see how well your resume matches the role.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Resume to audit</label>
        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a resume…" />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                <div className="flex items-center gap-2">
                  <FileText className="size-3.5 text-muted-foreground" />
                  <span>{r.version_name}</span>
                  {r.full_name && (
                    <span className="text-muted-foreground text-xs">— {r.full_name}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedResume && (
        <Badge variant="secondary" className="gap-1.5">
          <FileText className="size-3" />
          {selectedResume.version_name}
        </Badge>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Job Description</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={handlePaste}
          >
            <ClipboardPaste className="size-3" />
            Paste from clipboard
          </Button>
        </div>
        <div className="relative">
          <Textarea
            placeholder="Paste the full job description here…"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[280px] resize-y text-sm leading-relaxed focus:ring-slate-900"
            disabled={loading}
            maxLength={MAX_CHARS}
          />
          <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-md">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out",
                wordCount >= MIN_WORDS
                  ? "bg-emerald-500"
                  : wordCount > 0
                    ? "bg-muted-foreground/30"
                    : "bg-transparent"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "tabular-nums transition-colors",
                wordCount > 0 && wordCount < MIN_WORDS
                  ? "text-red-500 font-medium"
                  : "text-muted-foreground"
              )}
            >
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span
              className={cn(
                "tabular-nums transition-colors",
                charCount > MAX_CHARS * 0.9
                  ? "text-amber-500 font-medium"
                  : "text-muted-foreground"
              )}
            >
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
            </span>
          </div>
          {wordCount > 0 && wordCount < MIN_WORDS && (
            <span className="text-red-500">
              Please paste at least {MIN_WORDS} words for an accurate analysis.
            </span>
          )}
          {charCount > MAX_CHARS * 0.9 && charCount <= MAX_CHARS && (
            <span className="text-amber-500">
              Approaching character limit
            </span>
          )}
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!isValid || loading}
        onClick={() => onSubmit(selectedResumeId, jobDescription)}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          "Run Audit"
        )}
      </Button>
    </div>
  );
}
