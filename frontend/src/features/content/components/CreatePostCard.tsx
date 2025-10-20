/**
 * Social media style post creation card
 */

"use client";

import { useState, FormEvent } from "react";
import { useContentSubmission } from "../hooks/useContentSubmission";
import { Button, Alert } from "@/shared/components";
import {
  TextArea,
  RadioGroup,
  ImageUploader,
} from "@/shared/components/ui/inputs";
import { CONTENT_TYPES } from "@/config/constants";
import type { ContentType } from "@/shared/types";

interface CreatePostCardProps {
  userId: string;
  onPostCreated: (id: string) => void;
}

export function CreatePostCard({ userId, onPostCreated }: CreatePostCardProps) {
  const [contentType, setContentType] = useState<ContentType>(
    CONTENT_TYPES.TEXT
  );
  const [contentInput, setContentInput] = useState("");
  const [imageData, setImageData] = useState("");
  const [detectedImageUrl, setDetectedImageUrl] = useState<string | null>(null);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [forceImageUrl, setForceImageUrl] = useState(false);
  const { loading, error, submitContent } = useContentSubmission();

  // Auto-detect if input is an image URL
  const isImageUrl = (text: string): boolean => {
    try {
      const url = new URL(text.trim());
      // Check if URL protocol is http/https
      if (!["http:", "https:"].includes(url.protocol)) return false;

      const fullUrl = url.href.toLowerCase();
      const path = url.pathname.toLowerCase();
      const hostname = url.hostname.toLowerCase();

      // Check if URL ends with common image extensions
      const hasImageExtension =
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(path);

      // Check for image-related query parameters or paths
      const hasImageParam =
        url.search.includes("image") ||
        url.search.includes("img") ||
        path.includes("/image") ||
        path.includes("/img") ||
        path.includes("/photo") ||
        path.includes("/picture");

      // Check for common image hosting domains
      const isImageHost =
        hostname.includes("imgur") ||
        hostname.includes("unsplash") ||
        hostname.includes("cloudinary") ||
        hostname.includes("images") ||
        hostname.includes("media") ||
        hostname.includes("photos") ||
        hostname.includes("pbs.twimg") ||
        hostname.includes("i.redd") ||
        hostname.includes("imagekit") ||
        (hostname.includes("cloudfront") &&
          (path.includes("/image") || hasImageExtension));

      return hasImageExtension || hasImageParam || isImageHost;
    } catch {
      return false;
    }
  };

  // Check if content is a valid URL
  const isValidUrl = (text: string): boolean => {
    try {
      const url = new URL(text.trim());
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

  // Update detection when input changes
  const handleContentInputChange = (value: string) => {
    setContentInput(value);

    // Clear pasted image if user types something new
    if (pastedImage && value.trim() !== "") {
      setPastedImage(null);
    }

    // Reset force image URL if input is cleared or not a URL
    if (!value.trim() || !isValidUrl(value)) {
      setForceImageUrl(false);
    }

    // Auto-detect image URL
    if (isImageUrl(value)) {
      setDetectedImageUrl(value.trim());
    } else {
      setDetectedImageUrl(null);
    }
  };

  // Handle paste event for images
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Look for image in clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check if item is an image
      if (item.type.startsWith("image/")) {
        e.preventDefault(); // Prevent default paste behavior

        const file = item.getAsFile();
        if (!file) continue;

        // Convert image to base64
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setPastedImage(base64String);
          setContentInput(""); // Clear text input when image is pasted
          setDetectedImageUrl(null); // Clear detected URL
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  // Handle Enter key to submit (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line

      // Check if form is valid before submitting
      const hasContent =
        contentInput.trim() ||
        pastedImage ||
        detectedImageUrl ||
        (forceImageUrl && isValidUrl(contentInput));

      if (hasContent && !loading) {
        // Trigger form submission
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Determine if this is an image URL, pasted image, or text
      const isImageSubmission =
        detectedImageUrl !== null ||
        pastedImage !== null ||
        (forceImageUrl && isValidUrl(contentInput));

      // Determine content URL (converting null to undefined)
      let contentUrl: string | undefined = undefined;
      if (pastedImage) {
        contentUrl = pastedImage;
      } else if (detectedImageUrl) {
        contentUrl = detectedImageUrl;
      } else if (forceImageUrl && isValidUrl(contentInput)) {
        contentUrl = contentInput.trim();
      } else if (contentType === CONTENT_TYPES.IMAGE && imageData) {
        contentUrl = imageData;
      }

      const response = await submitContent({
        userId,
        contentType:
          contentType === CONTENT_TYPES.IMAGE
            ? CONTENT_TYPES.IMAGE
            : isImageSubmission
            ? CONTENT_TYPES.IMAGE
            : CONTENT_TYPES.TEXT,
        contentText:
          contentType === CONTENT_TYPES.TEXT && !isImageSubmission
            ? contentInput.trim()
            : undefined,
        contentUrl,
      });

      onPostCreated(response.submissionId);
      setContentInput("");
      setImageData("");
      setDetectedImageUrl(null);
      setPastedImage(null);
      setForceImageUrl(false);
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Content Type Selection */}
        <RadioGroup
          options={[
            {
              value: CONTENT_TYPES.TEXT,
              label: "Text or Image URL",
              icon: "📝",
            },
            { value: CONTENT_TYPES.IMAGE, label: "Upload Image", icon: "🖼️" },
          ]}
          value={contentType}
          onChange={(value) => setContentType(value as ContentType)}
          variant="button"
          disabled={loading}
        />

        {/* Input Area */}
        <div className="mt-3 space-y-3">
          {contentType === CONTENT_TYPES.TEXT ? (
            <>
              <TextArea
                value={contentInput}
                onChange={(e) => handleContentInputChange(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                required={!pastedImage}
                rows={3}
                disabled={loading}
                placeholder="Type text or paste image URL/image... (Press Enter to submit, Shift+Enter for new line)"
              />

              {/* Pasted Image Preview */}
              {pastedImage && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        Image pasted successfully
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPastedImage(null)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
                    <img
                      src={pastedImage}
                      alt="Pasted content"
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: "300px" }}
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Manual Image URL Toggle */}
              {!pastedImage &&
                !detectedImageUrl &&
                contentInput.trim() &&
                isValidUrl(contentInput) && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForceImageUrl(!forceImageUrl)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        forceImageUrl
                          ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                          : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {forceImageUrl
                        ? "✓ Treating as Image URL"
                        : "Treat as Image URL"}
                    </button>
                  </div>
                )}

              {/* Image Preview when URL is detected or forced */}
              {((detectedImageUrl && !pastedImage) ||
                (forceImageUrl && isValidUrl(contentInput))) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">
                      {detectedImageUrl ? "Image URL detected" : "Image URL"}
                    </span>
                  </div>
                  <div className="rounded-lg overflow-hidden bg-gray-100 border-2 border-blue-200">
                    <img
                      src={detectedImageUrl || contentInput.trim()}
                      alt="Preview"
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: "300px" }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                        e.currentTarget.alt = "Invalid image URL";
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <ImageUploader
              value={imageData}
              onChange={setImageData}
              disabled={loading}
              helperText="Upload an image to share"
            />
          )}
        </div>

        {error && (
          <Alert type="error" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Submit Button */}
        <div className="mt-3">
          <Button type="submit" loading={loading} fullWidth>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
