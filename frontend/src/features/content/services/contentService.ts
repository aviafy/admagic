/**
 * Content moderation service
 * Handles all content submission and status checking operations
 */

import { API_BASE_URL } from "@/config/constants";
import { supabase } from "@/config/supabase";
import type {
  SubmitContentDto,
  SubmitContentResponse,
  ContentStatusResponse,
} from "../types";

class ContentService {
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  /**
   * Get authentication headers with JWT token
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  /**
   * Fetch with timeout wrapper
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = this.REQUEST_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  }

  /**
   * Submit content for moderation
   */
  async submitContent(data: SubmitContentDto): Promise<SubmitContentResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/content/submit`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to submit content";

        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;

          // Add helpful context for common errors
          if (
            errorMessage.includes("table") &&
            errorMessage.includes("not found")
          ) {
            errorMessage =
              "Database not set up. Please run the database setup instructions.";
          }
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = `Server error: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check your connection.");
    }
  }

  /**
   * Get the status of a content submission
   */
  async getSubmissionStatus(
    submissionId: string
  ): Promise<ContentStatusResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/content/status/${submissionId}`,
        {
          method: "GET",
          headers,
        },
        10000 // 10 second timeout for status checks
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get submission status");
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check your connection.");
    }
  }

  /**
   * Generate an image from text prompt using DALL-E 3
   */
  async generateImage(
    prompt: string,
    size?: "1024x1024" | "1792x1024" | "1024x1792",
    quality?: "standard" | "hd"
  ): Promise<{ imageUrl: string; revisedPrompt?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/content/generate-image`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ prompt, size, quality }),
        },
        60000 // 60 seconds timeout for image generation (can take a while)
      );

      if (!response.ok) {
        let errorMessage = "Failed to generate image";

        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check your connection.");
    }
  }
}

export const contentService = new ContentService();
