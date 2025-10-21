/**
 * Content submission form component
 */

"use client";

import { useState, FormEvent } from "react";
import { useContentSubmission } from "../hooks/useContentSubmission";
import { Button, Alert } from "@/shared/components";
import { Input } from "@/shared/components/ui/inputs";
import { CONTENT_TYPES } from "@/config/constants";
import type { ContentType } from "@/shared/types";

interface ContentFormProps {
  onSubmissionCreated: (id: string) => void;
}

export function ContentForm({ onSubmissionCreated }: ContentFormProps) {
  const [contentType, setContentType] = useState<ContentType>(
    CONTENT_TYPES.TEXT
  );
  const [contentText, setContentText] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [validationError, setValidationError] = useState("");
  const { loading, error, submitContent } = useContentSubmission();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validate input before submission
    if (contentType === CONTENT_TYPES.TEXT) {
      const trimmedText = contentText.trim();
      if (!trimmedText) {
        setValidationError("Please enter some content");
        return;
      }
      if (trimmedText.length > 10000) {
        setValidationError("Content text must be less than 10,000 characters");
        return;
      }
    } else if (contentType === CONTENT_TYPES.IMAGE) {
      const trimmedUrl = contentUrl.trim();
      if (!trimmedUrl) {
        setValidationError("Please enter an image URL");
        return;
      }
      // Basic URL validation
      try {
        const url = new URL(trimmedUrl);
        if (!["http:", "https:"].includes(url.protocol)) {
          setValidationError("URL must start with http:// or https://");
          return;
        }
      } catch {
        setValidationError("Please enter a valid URL");
        return;
      }
    }

    try {
      const response = await submitContent({
        contentType,
        contentText:
          contentType === CONTENT_TYPES.TEXT ? contentText.trim() : undefined,
        contentUrl:
          contentType === CONTENT_TYPES.IMAGE ? contentUrl.trim() : undefined,
      });

      onSubmissionCreated(response.submissionId);
      setContentText("");
      setContentUrl("");
    } catch (err) {
      // Error is already set in the hook
      console.error("Submission error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Content Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value={CONTENT_TYPES.TEXT}
              checked={contentType === CONTENT_TYPES.TEXT}
              onChange={() => setContentType(CONTENT_TYPES.TEXT)}
              className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Text</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value={CONTENT_TYPES.IMAGE}
              checked={contentType === CONTENT_TYPES.IMAGE}
              onChange={() => setContentType(CONTENT_TYPES.IMAGE)}
              className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Image URL</span>
          </label>
        </div>
      </div>

      {/* Content Input */}
      {contentType === CONTENT_TYPES.TEXT ? (
        <div>
          <label
            htmlFor="content-text"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Content Text
          </label>
          <textarea
            id="content-text"
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            required
            maxLength={10000}
            rows={4}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="Enter your content here... (max 10,000 characters)"
          />
          <div className="text-xs text-gray-500 mt-1">
            {contentText.length} / 10,000 characters
          </div>
        </div>
      ) : (
        <Input
          id="content-url"
          type="url"
          label="Image URL"
          placeholder="https://example.com/image.jpg"
          value={contentUrl}
          onChange={(e) => setContentUrl(e.target.value)}
          disabled={loading}
          required
        />
      )}

      {validationError && <Alert type="error">{validationError}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <Button type="submit" loading={loading} fullWidth>
        Submit for Moderation
      </Button>
    </form>
  );
}
