/**
 * Root layout component
 * Provides global styles and context providers
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/features/auth';
import { ErrorBoundary } from '@/shared/components';
import { LLMProviderProvider } from '@/shared/contexts/LLMProviderContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Content Moderator',
  description: 'AI-powered content moderation using LangGraph and Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <LLMProviderProvider>
            <AuthProvider>{children}</AuthProvider>
          </LLMProviderProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
