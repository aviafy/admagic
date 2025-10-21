/**
 * Social media style post card
 */

"use client";

import { useState } from "react";
import { formatDate, capitalize } from "@/shared/utils/format";
import { STATUS_COLORS, STATUS_ICONS } from "@/config/constants";
import type { ContentStatus } from "@/shared/types";

interface PostCardProps {
  userEmail: string;
  content: string;
  contentType: "text" | "image";
  status: ContentStatus;
  aiDecision?: {
    decision: string;
    reasoning: string;
    classification: string;
    analysisResult?: {
      isSafe: boolean;
      concerns: string[];
      severity: string;
    };
    visualizationUrl?: string;
    aiProvider?: "openai" | "gemini";
  };
  createdAt: string;
  isOptimistic?: boolean; // Flag to indicate this is an optimistic post
}

export function PostCard({
  userEmail,
  content,
  contentType,
  status,
  aiDecision,
  createdAt,
  isOptimistic = false,
}: PostCardProps) {
  // State for click-to-reveal functionality for flagged/rejected images
  const [isImageRevealed, setIsImageRevealed] = useState(false);

  // Check if image should be blurred (flagged or rejected)
  const shouldBlurImage =
    contentType === "image" && (status === "flagged" || status === "rejected");
  const isImageBlurred = shouldBlurImage && !isImageRevealed;

  const getStatusColor = (status: ContentStatus) => {
    return STATUS_COLORS[status] || STATUS_COLORS.pending;
  };

  const getStatusIcon = (status: ContentStatus) => {
    return STATUS_ICONS[status] || STATUS_ICONS.pending;
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 animate-slide-in-from-top"
      style={{
        opacity: isOptimistic ? 0.7 : 1,
        animation: "slideInFromTop 0.4s ease-out forwards",
      }}
    >
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {userEmail.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{userEmail}</p>
            <p className="text-xs text-gray-500">{formatDate(createdAt)}</p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
            status
          )}`}
        >
          <span className="mr-1">{getStatusIcon(status)}</span>
          {capitalize(status)}
        </span>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        {contentType === "text" ? (
          <p className="text-gray-800 whitespace-pre-wrap break-words">
            {content || "(No content)"}
          </p>
        ) : (
          <div className="mt-2">
            {content ? (
              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={content}
                  alt="Posted content"
                  className={`w-full h-auto object-contain transition-all duration-300 ${
                    isImageBlurred ? "blur-2xl scale-105" : ""
                  }`}
                  style={{ maxHeight: "500px" }}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/400x300?text=Image+Not+Found";
                    e.currentTarget.alt = "Image failed to load";
                  }}
                />

                {/* Blur Overlay for Flagged/Rejected Images */}
                {isImageBlurred && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm bg-white/20 hover:bg-white/30 transition-all duration-200"
                    onClick={() => setIsImageRevealed(true)}
                  >
                    <div className="text-center p-6 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl max-w-xs mx-4 border-2 border-gray-200">
                      <div className="mb-3">
                        <span className="text-4xl">
                          {status === "rejected" ? "🚫" : "⚠️"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {status === "rejected"
                          ? "Rejected Content"
                          : "Flagged Content"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        This image has been {status} by AI moderation
                      </p>
                      <div className="flex items-center justify-center gap-2 text-blue-600 font-medium text-sm">
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>Click to reveal</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* "Hide" button when image is revealed */}
                {shouldBlurImage && isImageRevealed && (
                  <button
                    onClick={() => setIsImageRevealed(false)}
                    className="absolute top-3 right-3 bg-black bg-opacity-70 hover:bg-opacity-90 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                    Hide
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-100 flex items-center justify-center h-48">
                <p className="text-gray-500 text-sm">No image URL provided</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Analysis (if status is not pending) */}
      {aiDecision && status !== "pending" && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 space-y-2">
            <div className="flex items-start space-x-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  aiDecision.aiProvider === "gemini"
                    ? "bg-gradient-to-br from-purple-400 to-purple-600"
                    : "bg-gradient-to-br from-blue-400 to-blue-600"
                }`}
              >
                {aiDecision.aiProvider === "gemini" ? (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-gray-700">
                    AI Analysis
                  </p>
                  {aiDecision.aiProvider && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        aiDecision.aiProvider === "gemini"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {aiDecision.aiProvider === "gemini" ? (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
                          </svg>
                          Gemini
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                          </svg>
                          OpenAI
                        </>
                      )}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                  {aiDecision.reasoning}
                </p>

                {aiDecision.analysisResult?.concerns &&
                  aiDecision.analysisResult.concerns.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-600">
                        Concerns:
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {aiDecision.analysisResult.concerns.map(
                          (concern, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md font-medium"
                            >
                              {concern}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* AI-Generated Visualization Image */}
            {aiDecision.visualizationUrl && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-xs font-medium text-gray-600">
                    AI-Generated Explanation:
                  </p>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      aiDecision.aiProvider === "gemini"
                        ? "bg-gradient-to-br from-purple-400 to-purple-600"
                        : "bg-gradient-to-br from-blue-400 to-blue-600"
                    }`}
                  >
                    {aiDecision.aiProvider === "gemini" ? (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L9.5 9.5L2 12L9.5 14.5L12 22L14.5 14.5L22 12L14.5 9.5L12 2Z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden border-2 border-blue-200 bg-gray-50">
                  <img
                    src={aiDecision.visualizationUrl}
                    alt="AI-generated explanation of moderation concerns"
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: "400px" }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {status === "pending" && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-2 text-blue-600">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm">AI is analyzing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
