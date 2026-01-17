/**
 * Application Constants
 * Centralized configuration for resume upload and parsing
 */

// ============================================================================
// POLLING CONFIGURATION
// ============================================================================

export const RESUME_POLLING = {
  INTERVAL: 2000, // Poll backend every 2 seconds
  MAX_ATTEMPTS: 60, // Stop after 60 attempts (2 minutes total)
  TIMEOUT_MESSAGE:
    "Parsing is taking longer than expected. Please refresh the page.",
} as const;

// ============================================================================
// FILE VALIDATION
// ============================================================================

export const FILE_UPLOAD = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB in bytes
  MAX_SIZE_MB: 5, // 5MB for display
  ALLOWED_TYPES: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ALLOWED_EXTENSIONS: [".pdf", ".docx"],
} as const;

// ============================================================================
// UI MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  FILE_TYPE: "Invalid file type. Please upload PDF or DOCX.",
  FILE_SIZE_EXCEEDED: "File is too large.",
  UPLOAD_FAILED: "Upload failed. Please try again.",
  UPLOAD_ERROR_TOAST: "Failed to upload file",
  PARSING_FAILED: "Failed to retrieve final resume details",
  PARSING_DATA_MISSING: "Parsing completed but failed to load data",
  SAVE_FAILED: "Failed to save resume. Please try again.",
} as const;

export const SUCCESS_MESSAGES = {
  PARSE_COMPLETED: "Resume parsed successfully",
  SAVE_COMPLETED: "Resume saved successfully!",
  SIGNUP_CHECK_EMAIL: "Please check your email to verify your account.",
} as const;

// ============================================================================
// STATUS MESSAGES
// ============================================================================

export const STATUS_MESSAGES = {
  Pending: "Resume is queued for processing...",
  Processing: "Analysing your resume...",
  Completed: "Analysis complete!",
  Failed: "Failed to process resume.",
} as const;
