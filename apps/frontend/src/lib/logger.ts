/**
 * Centralized Logger Utility for Frontend
 * 
 * Captures user actions, errors, and events, then sends them to the backend
 * logging endpoint without blocking the UI.
 * 
 * Usage:
 *   logger.info("User logged in", { userId: "123" })
 *   logger.error("API call failed", { endpoint: "/api/users" })
 *   logger.warning("High memory usage detected")
 *   logger.debug("Component mounted", { component: "LoginForm" })
 */

import { apiClient } from "@/middle-service/client";

type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

interface LogContext {
  [key: string]: any;
}

interface LogOptions {
  level: LogLevel;
  message: string;
  source: string;
  context?: LogContext;
  userId?: string;
  sessionId?: string;
  extraData?: LogContext;
}

/**
 * Logger class for capturing and submitting frontend logs
 */
class Logger {
  private static instance: Logger;
  private sessionId: string;
  private userId: string | null = null;
  private isOnline: boolean = navigator.onLine;
  private isDev: boolean = process.env.NODE_ENV === "development";

  private constructor() {
    this.sessionId = this.getOrCreateSessionId();

    window.addEventListener("online", () => {
      this.isOnline = true;
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  /**
   * Get singleton instance of Logger
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Get or create a unique session ID
   */
  private getOrCreateSessionId(): string {
    const key = "optihire_session_id";
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set the current user ID for log tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Clear the user ID (e.g., on logout)
   */
  clearUserId(): void {
    this.userId = null;
  }

  /**
   * Submit a log to the backend
   * Sends logs asynchronously without blocking UI
   */
  private async submitLog(options: LogOptions): Promise<void> {
    // Don't block the UI - submit in background
    setTimeout(async () => {
      try {
        // Prepare payload
        const payload = {
          level: options.level,
          message: options.message,
          source: options.source,
          timestamp: new Date(),
          user_id: this.userId,
          session_id: this.sessionId,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          user_agent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          context: options.context,
          extra_data: options.extraData,
        };

        // Send to backend (FastAPI route lives under /api/v1/system/log)
        const response = await apiClient.post("/api/v1/system/log", payload);

        if (response.status === 200) {
          // Success - no console output needed
        }
      } catch (error) {
        // Silently fail - don't break the application
        if (this.isDev) {
          console.error("[Logger] Failed to submit:", error);
        }
      }
    }, 0);
  }

  error(message: string, context?: LogContext, extraData?: LogContext): void {
    if (this.isDev) console.error(`[ERROR] ${message}`, context);

    this.submitLog({
      level: "ERROR",
      message,
      source: this.getSourceContext(),
      context,
      extraData,
    });
  }

  warning(message: string, context?: LogContext, extraData?: LogContext): void {
    if (this.isDev) console.warn(`[WARNING] ${message}`, context);

    this.submitLog({
      level: "WARNING",
      message,
      source: this.getSourceContext(),
      context,
      extraData,
    });
  }

  info(message: string, context?: LogContext, extraData?: LogContext): void {
    if (this.isDev) console.info(`[INFO] ${message}`, context);

    this.submitLog({
      level: "INFO",
      message,
      source: this.getSourceContext(),
      context,
      extraData,
    });
  }

  debug(message: string, context?: LogContext, extraData?: LogContext): void {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, context);

      this.submitLog({
        level: "DEBUG",
        message,
        source: this.getSourceContext(),
        context,
        extraData,
      });
    }
  }

  critical(message: string, context?: LogContext, extraData?: LogContext): void {
    if (this.isDev) console.error(`[CRITICAL] ${message}`, context);

    this.submitLog({
      level: "CRITICAL",
      message,
      source: this.getSourceContext(),
      context,
      extraData,
    });
  }

  private getSourceContext(): string {
    if (typeof window === "undefined") {
      return "unknown";
    }

    // Try to extract from current pathname
    const path = window.location.pathname;
    const source = path.split("/").filter(Boolean)[0] || "root";
    return source;
  }

  /**
   * Log API errors with standardized format
   */
  logApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: any,
    context?: LogContext
  ): void {
    const message = `API Error: ${method} ${endpoint}`;
    this.error(message, {
      endpoint,
      method,
      status_code: statusCode,
      error: error?.message || error?.toString?.(),
      ...context,
    });
  }

  /**
   * Log user actions (login, logout, form submission, etc.)
   */
  logUserAction(
    action: string,
    details?: LogContext,
    source?: string
  ): void {
    this.info(`User Action: ${action}`, {
      action,
      source: source || this.getSourceContext(),
      ...details,
    });
  }

  /**
   * Log page transitions/navigation
   */
  logNavigation(from: string, to: string): void {
    this.info(`Navigation`, {
      from,
      to,
    });
  }
}

/**
 * Export singleton logger instance
 */
export const logger = Logger.getInstance();

/**
 * Export type for TypeScript support
 */
export type { LogLevel, LogContext };
