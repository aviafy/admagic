/**
 * Authentication service
 * Handles all authentication operations with Supabase
 */

import { supabase } from '@/config/supabase';
import type { AuthResponse, SignUpCredentials, SignInCredentials, AuthUser } from '../types';

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        return {
          user: null,
          error: { message: error.message, code: error.code },
        };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          user: null,
          error: {
            message:
              "Please check your email to verify your account. If you don't see the email, check your spam folder or try again later.",
            code: 'email_confirmation_required',
          },
        };
      }

      return {
        user: data.user
          ? { id: data.user.id, email: data.user.email || '' }
          : null,
        error: null,
      };
    } catch (err: any) {
      return {
        user: null,
        error: { message: err.message || 'An unexpected error occurred' },
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        let message = error.message;
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please verify your email before signing in.';
        }

        return {
          user: null,
          error: { message, code: error.code },
        };
      }

      return {
        user: data.user
          ? { id: data.user.id, email: data.user.email || '' }
          : null,
        error: null,
      };
    } catch (err: any) {
      return {
        user: null,
        error: { message: err.message || 'An unexpected error occurred' },
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: { message: string } | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: { message: error.message } };
      }
      return { error: null };
    } catch (err: any) {
      return {
        error: { message: err.message || 'An unexpected error occurred' },
      };
    }
  }

  /**
   * Get the current session
   */
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      console.error('Error getting session:', err);
      return null;
    }
  }

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user ? { id: user.id, email: user.email || '' } : null;
    } catch (err) {
      console.error('Error getting user:', err);
      return null;
    }
  }
}

export const authService = new AuthService();
