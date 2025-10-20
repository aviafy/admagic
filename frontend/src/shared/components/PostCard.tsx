/**
 * Social media style post card
 */

"use client";

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
  };
  createdAt: string;
}

export function PostCard({
  userEmail,
  content,
  contentType,
  status,
  aiDecision,
  createdAt,
}: PostCardProps) {
  const getStatusColor = (status: ContentStatus) => {
    return STATUS_COLORS[status] || STATUS_COLORS.pending;
  };

  const getStatusIcon = (status: ContentStatus) => {
    return STATUS_ICONS[status] || STATUS_ICONS.pending;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
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
              <div className="rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={content}
                  alt="Posted content"
                  className="w-full h-auto object-contain transition-opacity duration-300"
                  style={{ maxHeight: "500px" }}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/400x300?text=Image+Not+Found";
                    e.currentTarget.alt = "Image failed to load";
                  }}
                />
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
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700">
                  AI Analysis
                </p>
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
                <p className="text-xs font-medium text-gray-600 mb-2">
                  AI-Generated Explanation:
                </p>
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
