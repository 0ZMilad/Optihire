"use client";

import { useState, useRef, useCallback } from "react";
import { CloudUpload, AlertCircle } from "lucide-react";
import { Card } from "./ui/card";

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
  onFileSelect: (file: File) => void; 
  disabled?: boolean;                 
  error?: string | null;              
  className?: string;
}

export function ResumeUpload({
  onFileSelect,
  disabled = false,
  error: propError, 
  className,
}: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  // We keep a local error state for immediate validation feedback (e.g. file too big)
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state: Show either the server error (prop) or local validation error
  const activeError = propError || validationError;

  // Internal helper to handle file selection from Drop or Input
  const handleFileSelection = useCallback((file: File) => {
    // 1. Validate Locally
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    // 2. If valid, clear local error and pass to parent
    setValidationError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  // --- Handlers ---

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragOver) {
      setIsDragOver(true);
    }
  }, [isDragOver, disabled]);

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

      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    },
    [disabled, handleFileSelection]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
      // Reset value to allow selecting the same file again if retry is needed
      e.target.value = "";
    },
    [disabled, handleFileSelection]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!disabled) {
          fileInputRef.current?.click();
        }
      }
    },
    [disabled]
  );

  return (
    <Card
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload resume file"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onKeyDown={handleKeyDown}
      className={`
        relative flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${className}
        ${isDragOver 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }
        ${activeError ? "border-destructive bg-destructive/5" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer"}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        className="hidden"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        disabled={disabled}
      />

      {activeError ? (
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">{activeError}</p>
            <p className="text-xs text-muted-foreground">
              {disabled ? "Please wait..." : "Click or drag to try again"}
            </p>
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