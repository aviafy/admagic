/**
 * Validation utility functions
 */

import { MIN_PASSWORD_LENGTH } from '@/config/constants';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }
  return { isValid: true };
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
