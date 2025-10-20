/**
 * Authentication form component
 * Handles both sign-up and sign-in functionality
 */

'use client';

import { useState, FormEvent } from 'react';
import { authService } from '../services/authService';
import { isValidPassword } from '@/shared/utils/validation';
import { Button, Alert } from '@/shared/components';
import { Input } from '@/shared/components/ui/inputs';
import type { MessageType } from '../types';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('error');

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();

    // Validate password
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.isValid) {
      setMessage(passwordValidation.message || 'Invalid password');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { user, error } = await authService.signUp({ email, password });

        if (error) {
          if (error.message.includes('rate') || error.message.includes('429')) {
            setMessage(
              'Too many signup attempts. Please wait a few minutes and try again, or try signing in if you already have an account.'
            );
          } else if (error.code === 'email_confirmation_required') {
            setMessage(error.message);
            setMessageType('info');
          } else if (error.message.includes('already registered')) {
            setMessage('This email is already registered. Please sign in instead.');
            setMessageType('info');
            setIsSignUp(false);
          } else {
            setMessage(error.message);
          }
          setMessageType('error');
        } else if (user) {
          setMessage('Account created successfully! You are now signed in.');
          setMessageType('success');
        }
      } else {
        const { user, error } = await authService.signIn({ email, password });

        if (error) {
          setMessage(error.message);
          setMessageType('error');
        } else if (user) {
          setMessage('Signed in successfully!');
          setMessageType('success');
        }
      }
    } catch (error: any) {
      setMessage(error.message || 'An unexpected error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setMessage('');
    setMessageType('error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            AI Content Moderator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              minLength={6}
              required
            />
          </div>

          {message && <Alert type={messageType}>{message}</Alert>}

          <Button type="submit" loading={loading} fullWidth>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="text"
              onClick={toggleMode}
              disabled={loading}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>For testing, you can use any email and password (min 6 chars)</p>
        </div>
      </div>
    </div>
  );
}
