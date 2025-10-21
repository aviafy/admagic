/**
 * Content feed hook
 * Fetches and manages user's content submissions feed
 */

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";
import type { ContentSubmission } from "../types";

export function useContentFeed(userId: string) {
  const [posts, setPosts] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    // Don't fetch if no userId
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("content_submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map snake_case from database to camelCase for frontend
      const mappedPosts: ContentSubmission[] = (data || []).map(
        (post: any) => ({
          id: post.id,
          userId: post.user_id,
          contentType: post.content_type,
          contentText: post.content_text,
          contentUrl: post.content_url,
          status: post.status,
          aiDecision: post.ai_decision,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
        })
      );

      setPosts(mappedPosts);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a userId
    if (!userId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch initial posts only if mounted
    const initialFetch = async () => {
      if (isMounted) {
        await fetchPosts();
      }
    };

    initialFetch();

    // Set up real-time subscription for new posts
    const subscription = supabase
      .channel(`content_submissions_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content_submissions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(
            "✅ Real-time change received:",
            payload.eventType,
            payload
          );

          if (!isMounted) return;

          // Handle different event types for optimistic updates
          if (payload.eventType === "INSERT" && payload.new) {
            // Create the new post object
            const newPost: ContentSubmission = {
              id: payload.new.id,
              userId: payload.new.user_id,
              contentType: payload.new.content_type,
              contentText: payload.new.content_text,
              contentUrl: payload.new.content_url,
              status: payload.new.status,
              aiDecision: payload.new.ai_decision,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
            };
            console.log("✅ Adding new post to feed:", newPost.id);

            // Remove any optimistic post with matching content (to avoid duplicates)
            // and add the real post from the database
            setPosts((prev) => {
              // Find and remove optimistic post with same content
              const withoutOptimistic = prev.filter((post) => {
                if (!post.id.startsWith("optimistic-")) return true;

                // Check if this optimistic post matches the new real post
                const textMatches =
                  post.contentText &&
                  newPost.contentText &&
                  post.contentText === newPost.contentText;
                const urlMatches =
                  post.contentUrl &&
                  newPost.contentUrl &&
                  post.contentUrl === newPost.contentUrl;

                if (textMatches || urlMatches) {
                  console.log(
                    "🔄 Replacing optimistic post",
                    post.id,
                    "with real post",
                    newPost.id
                  );
                  return false; // Remove this optimistic post
                }
                return true; // Keep other optimistic posts
              });

              // Add the new real post at the beginning
              return [newPost, ...withoutOptimistic];
            });
          } else if (payload.eventType === "UPDATE" && payload.new) {
            // Update existing post in the list
            const updatedPost: ContentSubmission = {
              id: payload.new.id,
              userId: payload.new.user_id,
              contentType: payload.new.content_type,
              contentText: payload.new.content_text,
              contentUrl: payload.new.content_url,
              status: payload.new.status,
              aiDecision: payload.new.ai_decision,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
            };
            console.log(
              "✅ Updating post in feed:",
              updatedPost.id,
              "Status:",
              updatedPost.status
            );
            setPosts((prev) =>
              prev.map((post) =>
                post.id === updatedPost.id ? updatedPost : post
              )
            );
          } else if (payload.eventType === "DELETE" && payload.old) {
            // Remove deleted post from the list
            console.log("✅ Removing post from feed:", payload.old.id);
            setPosts((prev) =>
              prev.filter((post) => post.id !== payload.old.id)
            );
          } else {
            // Fallback: refetch all posts for any other case
            console.log("⚠️ Unknown event type, refetching all posts");
            fetchPosts();
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Realtime subscription active for user:", userId);
        } else if (status === "CHANNEL_ERROR") {
          console.error("❌ Realtime subscription error:", err);
          console.error(
            "❌ This likely means Realtime is not enabled on the content_submissions table"
          );
          console.error("❌ Falling back to polling only");
        } else if (status === "TIMED_OUT") {
          console.error("❌ Realtime subscription timed out");
        } else if (status === "CLOSED") {
          console.log("🔴 Realtime subscription closed");
        } else {
          console.log("📡 Realtime subscription status:", status);
        }
      });

    // Cleanup function
    return () => {
      isMounted = false;
      // Properly unsubscribe from channel
      subscription.unsubscribe().then(() => {
        supabase.removeChannel(subscription);
      });
    };
  }, [userId]);

  /**
   * Add an optimistic post immediately (before backend response)
   */
  const addOptimisticPost = (post: ContentSubmission) => {
    setPosts((prev) => [post, ...prev]);
  };

  /**
   * Remove an optimistic post (if submission fails)
   */
  const removeOptimisticPost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  /**
   * Replace an optimistic post with the real one from backend
   */
  const replaceOptimisticPost = (
    optimisticId: string,
    realPost: ContentSubmission
  ) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === optimisticId ? realPost : post))
    );
  };

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    addOptimisticPost,
    removeOptimisticPost,
    replaceOptimisticPost,
  };
}
