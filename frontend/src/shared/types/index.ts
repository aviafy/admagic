/**
 * Shared TypeScript types used across the application
 */

// User types
export interface User {
  id: string;
  email: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Content types
export type ContentType = 'text' | 'image';

export type ContentStatus = 'pending' | 'approved' | 'flagged' | 'rejected';

export type ModerationDecision = 'approved' | 'flagged' | 'rejected';

export type SeverityLevel = 'low' | 'medium' | 'high';
