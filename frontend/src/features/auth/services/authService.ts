/**
 * Authentication service - Simplified
 * Handles all authentication operations with Supabase
 */

import { supabase } from "@/config/supabase";
import type {
  AuthResponse,
  SignUpCredentials,
  SignInCredentials,
  AuthUser,
} from "../types";

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse & { requiresEmailConfirmation?: boolean }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (error) {
        // Make error messages more user-friendly
        let userMessage = error.message;
        if (error.message.includes("User already registered")) {
          userMessage = "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes("Password")) {
          userMessage = "Password is too weak. Please use a stronger password.";
        }
        return { user: null, error: { message: userMessage } };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          user: data.user
            ? { id: data.user.id, email: data.user.email || "" }
            : null,
          error: null,
          requiresEmailConfirmation: true,
        };
      }

      // Successful signup with auto-login
      return {
        user: data.user
          ? { id: data.user.id, email: data.user.email || "" }
          : null,
        error: null,
        requiresEmailConfirmation: false,
      };
    } catch (err: any) {
      return {
        user: null,
        error: { message: err.message || "Failed to create account. Please try again." },
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (error) {
        // Make error messages more user-friendly
        let userMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          userMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("Email not confirmed")) {
          userMessage = "Please verify your email before signing in. Check your inbox for the verification link.";
        }
        return { user: null, error: { message: userMessage } };
      }

      return {
        user: data.user
          ? { id: data.user.id, email: data.user.email || "" }
          : null,
        error: null,
      };
    } catch (err: any) {
      return {
        user: null,
        error: { message: err.message || "Failed to sign in. Please try again." },
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
        error: { message: err.message || "Failed to sign out" },
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
      return user ? { id: user.id, email: user.email || "" } : null;
    } catch (err) {
      return null;
    }
  }
}

export const authService = new AuthService();
