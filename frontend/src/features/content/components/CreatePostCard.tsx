/**
 * Social media style post creation card
 */

"use client";

import { useState, FormEvent, useEffect } from "react";
import { useContentSubmission } from "../hooks/useContentSubmission";
import { contentService } from "../services/contentService";
import { Button, Alert, ModerationRulesModal } from "@/shared/components";
import {
  TextArea,
  RadioGroup,
  ImageUploader,
} from "@/shared/components/ui/inputs";
import { CONTENT_TYPES } from "@/config/constants";
import type { ContentType } from "@/shared/types";
import type { ContentSubmission } from "../types";
import { useLLMProvider } from "@/shared/contexts/LLMProviderContext";

interface CreatePostCardProps {
  onPostCreated: (id: string) => void;
  onOptimisticPost: (post: ContentSubmission) => void;
  onSubmissionError: (optimisticId: string) => void;
  onSubmissionSuccess: (
    optimisticId: string,
    realPost: ContentSubmission
  ) => void;
  userEmail: string;
}

export function CreatePostCard({
  onPostCreated,
  onOptimisticPost,
  onSubmissionError,
  onSubmissionSuccess,
  userEmail,
}: CreatePostCardProps) {
  const [contentType, setContentType] = useState<ContentType>(
    CONTENT_TYPES.TEXT
  );
  const [contentInput, setContentInput] = useState("");
  const [imageData, setImageData] = useState("");
  const [detectedImageUrl, setDetectedImageUrl] = useState<string | null>(null);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [forceImageUrl, setForceImageUrl] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageData, setGeneratedImageData] = useState<{
    imageUrl: string;
    originalPrompt: string;
    revisedPrompt?: string;
  } | null>(null);
  const { loading, error, submitContent } = useContentSubmission();
  const { provider } = useLLMProvider();

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

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!contentInput.trim() || generatingImage || loading) return;

    const promptToGenerate = contentInput.trim();
    setGeneratingImage(true);
    setGenerationError(null);

    try {
      const result = await contentService.generateImage(
        promptToGenerate,
        "1024x1024",
        "standard"
      );

      setGeneratedImageData({
        imageUrl: result.imageUrl,
        originalPrompt: promptToGenerate,
        revisedPrompt: result.revisedPrompt,
      });
      setDetectedImageUrl(result.imageUrl);
      setForceImageUrl(true);
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "Failed to generate image"
      );
    } finally {
      setGeneratingImage(false);
    }
  };

  // Handle regenerate (uses the original prompt)
  const handleRegenerateImage = async () => {
    if (generatingImage || loading || !generatedImageData) return;

    setGeneratingImage(true);
    setGenerationError(null);

    try {
      const result = await contentService.generateImage(
        generatedImageData.originalPrompt,
        "1024x1024",
        "standard"
      );

      setGeneratedImageData({
        ...generatedImageData,
        imageUrl: result.imageUrl,
        revisedPrompt: result.revisedPrompt,
      });
      setDetectedImageUrl(result.imageUrl);
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "Failed to regenerate image"
      );
    } finally {
      setGeneratingImage(false);
    }
  };

  // Handle download generated image
  const handleDownloadImage = async () => {
    if (!detectedImageUrl) return;

    try {
      const response = await fetch(detectedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setGenerationError("Failed to download image");
    }
  };

  // Handle discarding generated image
  const handleDiscardGenerated = () => {
    setDetectedImageUrl(null);
    setForceImageUrl(false);
    setGeneratedImageData(null);
    setGenerationError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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

    const finalContentType =
      contentType === CONTENT_TYPES.IMAGE
        ? CONTENT_TYPES.IMAGE
        : isImageSubmission
        ? CONTENT_TYPES.IMAGE
        : CONTENT_TYPES.TEXT;

    const finalContentText =
      contentType === CONTENT_TYPES.TEXT && !isImageSubmission
        ? contentInput.trim()
        : undefined;

    // Create optimistic post ID
    const optimisticId = `optimistic-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create optimistic post object
    const optimisticPost: ContentSubmission = {
      id: optimisticId,
      userId: userEmail, // Using email as placeholder
      contentType: finalContentType,
      contentText: finalContentText,
      contentUrl: contentUrl,
      status: "pending" as const,
      aiDecision: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add optimistic post immediately for instant UI feedback
    onOptimisticPost(optimisticPost);

    // Clear form immediately for better UX
    setContentInput("");
    setImageData("");
    setDetectedImageUrl(null);
    setPastedImage(null);
    setForceImageUrl(false);

    try {
      // Submit to backend
      const response = await submitContent({
        contentType: finalContentType,
        contentText: finalContentText,
        contentUrl,
        aiProvider: provider,
      });

      // When backend responds, replace optimistic post with real one
      // The real post will come via real-time subscription, but we still notify parent
      onPostCreated(response.submissionId);

      // Note: The real-time subscription will handle replacing the optimistic post
      // with the actual post from the database, so we don't need to manually replace here
    } catch (err) {
      // Remove optimistic post if submission failed
      onSubmissionError(optimisticId);

      // Restore form values so user can retry
      setContentInput(finalContentText || "");
      if (finalContentType === CONTENT_TYPES.IMAGE && contentUrl) {
        if (pastedImage) {
          setPastedImage(contentUrl);
        } else if (detectedImageUrl) {
          setContentInput(contentUrl);
          setDetectedImageUrl(contentUrl);
        } else {
          setImageData(contentUrl);
        }
      }
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

              {/* Loading State for Image Generation */}
              {generatingImage && (
                <div className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 animate-fade-in">
                  <svg
                    className="w-6 h-6 text-purple-600 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <div className="text-center">
                    <p className="text-purple-700 font-semibold">
                      Generating image...
                    </p>
                    <p className="text-purple-500 text-sm mt-1">
                      Usually takes 10-15 seconds
                    </p>
                  </div>
                </div>
              )}

              {/* Enhanced Preview Card for Generated Images */}
              {((detectedImageUrl && !pastedImage) ||
                (forceImageUrl && isValidUrl(contentInput))) &&
                !generatingImage && (
                  <div className="space-y-2 animate-fade-in">
                    {/* Check if this is a generated image */}
                    {generatedImageData ? (
                      // Enhanced Generated Image Card
                      <div className="border-2 border-purple-300 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3">
                          <div className="flex items-center gap-2">
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
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                              />
                            </svg>
                            <span className="font-bold">
                              AI Generated Image
                            </span>
                          </div>
                        </div>

                        {/* Image */}
                        <div className="p-3 bg-white">
                          <img
                            src={detectedImageUrl || ""}
                            alt="Generated"
                            className="w-full h-auto object-contain rounded-lg shadow-md transform transition-all duration-300 hover:scale-[1.02]"
                            style={{ maxHeight: "400px" }}
                            loading="lazy"
                          />
                        </div>

                        {/* Prompts Section */}
                        <div className="px-4 py-3 space-y-2 bg-white border-t border-purple-200">
                          <div>
                            <p className="text-xs font-semibold text-purple-600 mb-1">
                              Your Prompt:
                            </p>
                            <p className="text-sm text-gray-700 italic">
                              "{generatedImageData.originalPrompt}"
                            </p>
                          </div>
                          {generatedImageData.revisedPrompt && (
                            <div>
                              <p className="text-xs font-semibold text-blue-600 mb-1">
                                Enhanced by DALL-E:
                              </p>
                              <p className="text-sm text-gray-600 italic">
                                "{generatedImageData.revisedPrompt}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-purple-200 flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={handleRegenerateImage}
                            disabled={generatingImage || loading}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Regenerate
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadImage}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={handleDiscardGenerated}
                            className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-all duration-200"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Discard
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Regular Image URL Preview
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
                            {detectedImageUrl
                              ? "Image URL detected"
                              : "Image URL"}
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

        {generationError && (
          <Alert type="error" className="mt-3">
            {generationError}
          </Alert>
        )}

        {/* Submit Button with Rules and Generate Image Buttons */}
        <div className="mt-3 flex gap-2">
          <Button type="submit" loading={loading} className="flex-1">
            {loading ? "Submitting..." : "Submit"}
          </Button>

          {/* Generate Image Button - only show for text content type */}
          {contentType === CONTENT_TYPES.TEXT && contentInput.trim() && (
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={generatingImage || loading}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border ${
                generatingImage
                  ? "bg-purple-50 text-purple-400 border-purple-200 cursor-not-allowed"
                  : "bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300 hover:border-purple-400 group"
              }`}
              title="Generate image from text using AI"
            >
              <svg
                className={`w-5 h-5 ${
                  generatingImage ? "animate-spin" : "group-hover:scale-110"
                } transition-transform`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {generatingImage ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                )}
              </svg>
              <span className="hidden sm:inline">
                {generatingImage ? "Generating..." : "🎨 Generate"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border border-gray-300 hover:border-gray-400 group"
            title="View content moderation rules"
          >
            <svg
              className="w-5 h-5 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </form>

      {/* Moderation Rules Modal */}
      <ModerationRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </div>
  );
}
