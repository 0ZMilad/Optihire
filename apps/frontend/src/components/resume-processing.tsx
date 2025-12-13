"use client";

import { Loader2 } from "lucide-react";
import { Card } from "./ui/card";

interface ResumeProcessingProps {
  statusMessage?: string;
}

export function ResumeProcessing({ statusMessage }: ResumeProcessingProps) {
  return (
    <Card className="w-full max-w-xl mx-auto p-12 flex flex-col items-center text-center space-y-6">
      <div className="p-4 bg-primary/10 rounded-full">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">
          Analysing Your Resume
        </h3>
        
        <p className="text-muted-foreground min-h-[1.5rem] animate-pulse">
          {statusMessage || "Please wait while we extract your information..."}
        </p>
      </div>
      
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">
        This usually takes about 5-10 seconds
      </div>
    </Card>
  );
}