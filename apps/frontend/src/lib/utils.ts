import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize plain-text user input before sending to the backend.
 * Strips HTML/script tags, null bytes, and dangerous control characters.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")         // strip all HTML/XML tags
    .replace(/&[a-z]+;/gi, " ")      // decode common HTML entities to whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars (keep \t \n \r)
    .trim();
}
