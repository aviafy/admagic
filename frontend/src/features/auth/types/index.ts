/**
 * Authentication feature types
 */

import { User, ApiError } from '@/shared/types';

export interface AuthUser extends User {}

export interface AuthError extends ApiError {}

export interface AuthResponse {
  user: AuthUser | null;
  error: AuthError | null;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

export type MessageType = 'error' | 'success' | 'info';
