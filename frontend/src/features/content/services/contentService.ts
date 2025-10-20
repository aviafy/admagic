/**
 * Content moderation service
 * Handles all content submission and status checking operations
 */

import { API_BASE_URL } from '@/config/constants';
import type {
  SubmitContentDto,
  SubmitContentResponse,
  ContentStatusResponse,
} from '../types';

class ContentService {
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

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
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Submit content for moderation
   */
  async submitContent(
    data: SubmitContentDto
  ): Promise<SubmitContentResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/content/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to submit content';

        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;

          // Add helpful context for common errors
          if (errorMessage.includes('table') && errorMessage.includes('not found')) {
            errorMessage = 'Database not set up. Please run the database setup instructions.';
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
      throw new Error('Network error. Please check your connection.');
    }
  }

  /**
   * Get the status of a content submission
   */
  async getSubmissionStatus(
    submissionId: string
  ): Promise<ContentStatusResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/content/status/${submissionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        10000 // 10 second timeout for status checks
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get submission status');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }
}

export const contentService = new ContentService();
