/**
 * Main application page - Social media style feed
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth, AuthForm, authService } from "@/features/auth";
import {
  CreatePostCard,
  useContentFeed,
  contentService,
} from "@/features/content";
import { LoadingSpinner, Header, PostCard } from "@/shared/components";
import { POLL_INTERVAL_MS } from "@/config/constants";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const {
    posts,
    loading: feedLoading,
    refetch,
  } = useContentFeed(user?.id || "");
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    await authService.signOut();
  };

  const handlePostCreated = (id: string) => {
    setLastSubmissionId(id);
    refetch(); // Refresh feed when new post is created
  };

  // Note: Real-time updates are now handled by Supabase subscriptions in useContentFeed
  // This polling is kept as a fallback for the initial submission response
  useEffect(() => {
    if (!lastSubmissionId) return;

    let isMounted = true;
    const MAX_POLL_ATTEMPTS = 30; // Reduced to 30 attempts since we have real-time updates
    let pollAttempts = 0;

    // Exponential backoff for fallback polling
    const getPollingInterval = (attempt: number): number => {
      if (attempt <= 3) return 500; // Fast initial checks
      if (attempt <= 10) return 1000; // Medium speed
      return POLL_INTERVAL_MS; // Slower for later attempts
    };

    const pollSubmissionStatus = async () => {
      if (!isMounted || !lastSubmissionId) return;

      try {
        pollAttempts++;
        const status = await contentService.getSubmissionStatus(
          lastSubmissionId
        );

        console.log(`Page polling attempt ${pollAttempts}: ${status.status}`);

        // Stop polling if status is no longer pending
        if (status.status !== "pending") {
          console.log(
            "Status resolved, stopping page-level polling and refreshing feed"
          );

          // CRITICAL FIX: Refetch the feed to ensure updated status is displayed
          // This is the fallback in case Realtime subscription didn't trigger
          refetch();

          setLastSubmissionId(null);
          return;
        }

        // Continue polling if still pending and under max attempts
        if (pollAttempts < MAX_POLL_ATTEMPTS && isMounted) {
          const interval = getPollingInterval(pollAttempts);
          pollTimeoutRef.current = setTimeout(pollSubmissionStatus, interval);
        } else {
          // Stop polling after max attempts (real-time will take over)
          console.log(
            "Max polling attempts reached, relying on real-time updates"
          );
          setLastSubmissionId(null);
        }
      } catch (error) {
        console.error("Error polling submission status:", error);
        setLastSubmissionId(null);
      }
    };

    // Start polling with a slight delay to avoid race with Supabase INSERT event
    const initialDelay = setTimeout(() => {
      if (isMounted) pollSubmissionStatus();
    }, 500);

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(initialDelay);
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, [lastSubmissionId, refetch]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm />;
  }

  // Show main social feed
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header userEmail={user.email} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Create Post Card */}
        <CreatePostCard onPostCreated={handlePostCreated} />

        {/* Feed Loading */}
        {feedLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" message="Loading feed..." />
          </div>
        )}

        {/* Posts Feed */}
        {!feedLoading && posts.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              No posts yet. Create your first post!
            </p>
          </div>
        )}

        {!feedLoading && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                userEmail={user.email}
                content={post.contentText || post.contentUrl || ""}
                contentType={post.contentType}
                status={post.status}
                aiDecision={post.aiDecision}
                createdAt={post.createdAt}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
