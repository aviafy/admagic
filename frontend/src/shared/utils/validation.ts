/**
 * Validation utility functions - Simplified
 */

import { MIN_PASSWORD_LENGTH } from "@/config/constants";

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password - simple requirements check
 */
export function isValidPassword(password: string): boolean {
  return !!password && password.length >= MIN_PASSWORD_LENGTH;
}

/**
 * Validate content input
 */
export function isValidContent(content: string): boolean {
  return content.trim().length > 0;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
