/**
 * Application-wide constants
 */

export const APP_NAME = 'AI Content Moderator';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const MIN_PASSWORD_LENGTH = 6;

export const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds for moderation results

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
} as const;

export const CONTENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
} as const;

export const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  approved: 'bg-green-100 text-green-800',
  flagged: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
} as const;

export const STATUS_ICONS = {
  pending: '⋯',
  approved: '✓',
  flagged: '⚠',
  rejected: '✗',
} as const;
