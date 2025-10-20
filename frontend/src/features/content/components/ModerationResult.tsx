/**
 * Moderation result display component
 */

"use client";

import { useState, useEffect } from "react";
import { contentService } from "../services/contentService";
import { LoadingSpinner } from "@/shared/components";
import { formatDate, capitalize } from "@/shared/utils/format";
import {
  STATUS_COLORS,
  STATUS_ICONS,
  POLL_INTERVAL_MS,
} from "@/config/constants";
import type { ContentStatusResponse } from "../types";
import type { ContentStatus } from "@/shared/types";

interface ModerationResultProps {
  submissionId: string;
}

export function ModerationResult({ submissionId }: ModerationResultProps) {
  const [result, setResult] = useState<ContentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) return;

    const fetchStatus = async () => {
      try {
        const data = await contentService.getSubmissionStatus(submissionId);
        setResult(data);
        setLoading(false);

        // Continue polling if status is still pending
        if (data.status === "pending") {
          setTimeout(fetchStatus, POLL_INTERVAL_MS);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStatus();
  }, [submissionId]);

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>Error loading status: {error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center">
        <LoadingSpinner message="Loading submission status..." />
      </div>
    );
  }

  const getStatusColor = (status: ContentStatus) => {
    return STATUS_COLORS[status] || STATUS_COLORS.pending;
  };

  const getStatusIcon = (status: ContentStatus) => {
    return STATUS_ICONS[status] || STATUS_ICONS.pending;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Moderation Result</h2>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            result.status
          )}`}
        >
          <span className="mr-1">{getStatusIcon(result.status)}</span>
          {capitalize(result.status)}
        </span>
      </div>

      {/* Loading indicator for pending status */}
      {loading && result.status === "pending" && (
        <div className="flex items-center space-x-2 text-blue-600">
          <svg
            className="animate-spin h-5 w-5"
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
          <span>AI is analyzing your content...</span>
        </div>
      )}

      {/* AI Decision Details */}
      {result.aiDecision && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700">AI Decision:</h3>
            <p className="mt-1 text-sm text-gray-900 font-semibold">
              {capitalize(result.aiDecision.decision)}
            </p>
          </div>

          {result.aiDecision.reasoning && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Reasoning:</h3>
              <p className="mt-1 text-sm text-gray-900">
                {result.aiDecision.reasoning}
              </p>
            </div>
          )}

          {result.aiDecision.analysisResult && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Analysis Details:
              </h3>
              <div className="mt-1 text-sm text-gray-900 space-y-1">
                <p>
                  <strong>Safe:</strong>{" "}
                  {result.aiDecision.analysisResult.isSafe ? "Yes" : "No"}
                </p>
                {result.aiDecision.analysisResult.concerns?.length > 0 && (
                  <div>
                    <strong>Concerns:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {result.aiDecision.analysisResult.concerns.map(
                        (concern, idx) => (
                          <li key={idx}>{concern}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                <p>
                  <strong>Severity:</strong>{" "}
                  {capitalize(result.aiDecision.analysisResult.severity)}
                </p>
              </div>
            </div>
          )}

          {/* AI-Generated Visualization Image */}
          {result.aiDecision.visualizationUrl && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                AI-Generated Explanation:
              </h3>
              <div className="rounded-lg overflow-hidden border-2 border-blue-200 bg-gray-50">
                <img
                  src={result.aiDecision.visualizationUrl}
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
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 border-t pt-3 space-y-1">
        <p>
          <strong>Submission ID:</strong> {result.id}
        </p>
        <p>
          <strong>Created:</strong> {formatDate(result.createdAt)}
        </p>
        {result.updatedAt !== result.createdAt && (
          <p>
            <strong>Updated:</strong> {formatDate(result.updatedAt)}
          </p>
        )}
      </div>
    </div>
  );
}
