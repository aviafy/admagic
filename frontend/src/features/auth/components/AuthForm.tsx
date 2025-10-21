/**
 * Authentication form component - User-friendly and functional
 * Handles both sign-up and sign-in functionality
 */

"use client";

import { useState, FormEvent } from "react";
import { authService } from "../services/authService";
import { isValidPassword, isValidEmail } from "@/shared/utils/validation";
import { Button, Alert } from "@/shared/components";
import { Input } from "@/shared/components/ui/inputs";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Mark fields as touched for validation
    setEmailTouched(true);
    setPasswordTouched(true);

    // Validation
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const response = await authService.signUp({
          email,
          password,
        });

        if (response.error) {
          setError(response.error.message);
        } else if (response.requiresEmailConfirmation) {
          setSuccess(
            "Account created! Please check your email to verify your account before signing in."
          );
          setEmail("");
          setPassword("");
          setEmailTouched(false);
          setPasswordTouched(false);
        } else if (response.user) {
          setSuccess("Account created successfully! Redirecting...");
          setEmail("");
          setPassword("");
          setEmailTouched(false);
          setPasswordTouched(false);
        }
      } else {
        const { user, error: signInError } = await authService.signIn({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else if (user) {
          setSuccess("Welcome back! Redirecting...");
          setEmail("");
          setPassword("");
          setEmailTouched(false);
          setPasswordTouched(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
    setEmailTouched(false);
    setPasswordTouched(false);
  };

  // Real-time validation helpers
  const getEmailError = () => {
    if (!emailTouched || !email) return "";
    return !isValidEmail(email) ? "Please enter a valid email address" : "";
  };

  const getPasswordError = () => {
    if (!passwordTouched || !password) return "";
    return !isValidPassword(password)
      ? "Password must be at least 6 characters"
      : "";
  };

  const getPasswordStrength = () => {
    if (!password || password.length < 6) return null;
    if (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      return { label: "Strong", color: "text-green-600" };
    }
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return { label: "Good", color: "text-blue-600" };
    }
    return { label: "Fair", color: "text-yellow-600" };
  };

  const passwordStrength = isSignUp ? getPasswordStrength() : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg">
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            AI Content Moderator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <Alert type="error">
            <div className="text-sm">{error}</div>
          </Alert>
        )}

        {success && (
          <Alert type="success">
            <div className="text-sm">{success}</div>
          </Alert>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Input */}
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            disabled={loading}
            error={getEmailError()}
            required
          />

          {/* Password Input with visibility toggle */}
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder={isSignUp ? "At least 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              disabled={loading}
              error={getPasswordError()}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {isSignUp && passwordStrength && (
            <div className="text-sm">
              <span className="text-gray-600">Password strength: </span>
              <span className={`font-semibold ${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            loading={loading}
            fullWidth
            disabled={loading || !email || !password}
          >
            {loading
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </Button>

          {/* Toggle Mode */}
          <div className="text-center">
            <Button
              type="button"
              variant="text"
              onClick={toggleMode}
              disabled={loading}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </Button>
          </div>
        </form>

        {/* Helper Text */}
        {isSignUp && (
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Password requirements:</p>
            <ul className="text-left mx-auto max-w-xs space-y-1">
              <li className="flex items-center">
                <span className="mr-2">
                  {password.length >= 6 ? "✓" : "○"}
                </span>
                At least 6 characters
              </li>
              <li className="flex items-center text-gray-400">
                <span className="mr-2">
                  {password.length >= 8 &&
                  /[A-Z]/.test(password) &&
                  /[0-9]/.test(password)
                    ? "✓"
                    : "○"}
                </span>
                Recommended: 8+ chars, uppercase, and numbers
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
