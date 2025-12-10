"use client";

import { useState, useRef, useCallback } from "react";
import { CloudUpload, AlertCircle, FileText } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { Card } from "./ui/card";

import { uploadResume } from "@/middle-service/resumes";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pdf",
  ".docx",
];

const validateFile = (file: File): { valid: boolean; error: string | null } => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "File too large. Maximum size is 5MB.",
    };
  }

  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  
  const isValidType =
    ACCEPTED_TYPES.includes(file.type) ||
    ACCEPTED_TYPES.includes(fileExtension);

  if (!isValidType) {
    return {
      valid: false,
      error: "Invalid file type. Only PDF and DOCX are allowed.",
    };
  }

  return { valid: true, error: null };
};

interface ResumeUploadProps {
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export function ResumeUpload({
  onUploadSuccess,
  onUploadError,
  className,
}: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      setError(null);
      setFileName(file.name);
      setIsUploading(true);

      try {
        const data = await uploadResume(file);
        
        if (onUploadSuccess) {
          onUploadSuccess(data);
        }

        setFileName(null); 
        
      } catch (err: any) {
        console.error("Upload error:", err);
        
        const errorMessage =
          err?.response?.data?.message || "Failed to upload resume. Please try again.";
        
        setError(errorMessage);
        setFileName(null); 
        
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess, onUploadError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }, [isDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (isUploading) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [isUploading, processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isUploading) return;

      if (e.target.files && e.target.files.length > 0) {
        processFile(e.target.files[0]);
      }
      e.target.value = "";
    },
    [isUploading, processFile]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isUploading) {
          fileInputRef.current?.click();
        }
      }
    },
    [isUploading]
  );

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label="Upload resume file"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      onKeyDown={handleKeyDown}
      className={`
        relative flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${className}
        ${isDragOver 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }
        ${error ? "border-destructive bg-destructive/5" : ""}
        ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />

      {isUploading ? (
        <div className="flex flex-col items-center space-y-3">
          <Spinner className="w-8 h-8 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Uploading {fileName}...</p>
            <p className="text-xs text-muted-foreground">Please wait</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground">Click to try again</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <div className={`p-3 rounded-full ${isDragOver ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {isDragOver ? (
              <CloudUpload className="w-6 h-6 animate-bounce" />
            ) : (
              <CloudUpload className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragOver ? "Drop file here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF or DOCX (Max 5MB)
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}