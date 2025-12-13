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
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  // File validation errors
  FILE_TOO_LARGE: "File size exceeds 5MB limit. Please use a smaller file.",
  INVALID_TYPE: "Invalid file type. Only PDF and DOCX files are supported.",
  FILE_NOT_SELECTED: "Please select a file to upload.",

  // Upload errors
  UPLOAD_FAILED: "Failed to upload resume. Please try again.",
  UPLOAD_TIMEOUT: "Upload timed out. Check your connection and try again.",

  // Parsing errors
  PARSE_FAILED:
    "Could not parse your resume. Please try a different format or contact support.",
  PARSE_TIMEOUT:
    "Parsing is taking too long. Please try again or contact support.",

  // Network errors
  NETWORK_ERROR:
    "Network connection failed. Please check your internet connection.",
  SERVER_ERROR: "Server error occurred. Please try again later.",

  // Data retrieval errors
  FETCH_FAILED: "Failed to retrieve resume data. Please refresh the page.",

  // Save errors
  SAVE_FAILED: "Failed to save changes. Please try again.",
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: "Resume uploaded successfully!",
  PARSE_SUCCESS: "Resume parsed successfully!",
  SAVE_SUCCESS: "Resume saved successfully!",
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
