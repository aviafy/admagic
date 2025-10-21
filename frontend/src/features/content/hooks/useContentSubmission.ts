/**
 * Content submission hook
 * Manages content submission and status polling
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { contentService } from "../services/contentService";
import { POLL_INTERVAL_MS } from "@/config/constants";
import type { ContentStatusResponse, SubmitContentDto } from "../types";

export function useContentSubmission() {
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ContentStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit content for moderation
   */
  const submitContent = useCallback(async (data: SubmitContentDto) => {
    setLoading(true);
    setError(null);

    try {
      const response = await contentService.submitContent(data);
      setSubmissionId(response.submissionId);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Poll for status updates with exponential backoff
   * Starts fast (500ms) and gradually increases to 2s
   */
  useEffect(() => {
    if (!submissionId) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    let isPolling = false;
    const MAX_POLL_ATTEMPTS = 60; // Maximum 60 attempts (~2 minutes with backoff)
    let pollAttempts = 0;

    // Exponential backoff: start fast, then slow down
    const getPollingInterval = (attempt: number): number => {
      if (attempt <= 3) return 500; // First 3 attempts: 500ms (fast)
      if (attempt <= 10) return 1000; // Next 7 attempts: 1s
      return POLL_INTERVAL_MS; // After that: 2s
    };

    const fetchStatus = async () => {
      // Prevent concurrent polling requests
      if (isPolling || !isMounted) return;

      isPolling = true;
      pollAttempts++;

      try {
        const statusData = await contentService.getSubmissionStatus(
          submissionId
        );

        if (!isMounted) return;

        setStatus(statusData);

        // Continue polling if status is still pending and under max attempts
        if (
          statusData.status === "pending" &&
          pollAttempts < MAX_POLL_ATTEMPTS
        ) {
          const interval = getPollingInterval(pollAttempts);
          timeoutId = setTimeout(fetchStatus, interval);
        } else if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          setError(
            "Moderation is taking longer than expected. The status will update automatically when complete."
          );
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        isPolling = false;
      }
    };

    // Start polling immediately
    fetchStatus();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [submissionId]);

  /**
   * Reset submission state
   */
  const reset = useCallback(() => {
    setSubmissionId(null);
    setStatus(null);
    setError(null);
  }, []);

  return {
    submissionId,
    status,
    loading,
    error,
    submitContent,
    reset,
  };
}
