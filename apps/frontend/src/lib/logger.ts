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
  [key: string]: string | number | boolean | null | undefined | LogContext | Array<string | number | boolean>;
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
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isDev: boolean = process.env.NODE_ENV === "development";

  private constructor() {
    this.sessionId = this.getOrCreateSessionId();

    if (typeof window !== 'undefined') {
      window.addEventListener("online", () => {
        this.isOnline = true;
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
      });
    }
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
    if (typeof sessionStorage === 'undefined') return "server-session";
    
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
}

/**
 * Export singleton logger instance
 */
export const logger = Logger.getInstance();

/**
 * Export type for TypeScript support
 */
export type { LogLevel, LogContext };
