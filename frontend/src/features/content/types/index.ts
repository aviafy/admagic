/**
 * Content moderation feature types
 */

import {
  ContentType,
  ContentStatus,
  ModerationDecision,
  SeverityLevel,
} from "@/shared/types";

export interface ContentSubmission {
  id: string;
  userId: string;
  contentType: ContentType;
  contentText?: string;
  contentUrl?: string;
  status: ContentStatus;
  aiDecision?: AiDecision;
  createdAt: string;
  updatedAt: string;
}

export interface AiDecision {
  decision: ModerationDecision;
  reasoning: string;
  classification: "safe" | "flagged" | "harmful";
  analysisResult: AnalysisResult;
  visualizationUrl?: string; // Generated image URL for flagged content
}

export interface AnalysisResult {
  isSafe: boolean;
  concerns: string[];
  severity: SeverityLevel;
}

export interface SubmitContentDto {
  userId: string;
  contentType: ContentType;
  contentText?: string;
  contentUrl?: string;
}

export interface SubmitContentResponse {
  submissionId: string;
  status: string;
  message: string;
}

export interface ContentStatusResponse {
  id: string;
  status: ContentStatus;
  contentType: ContentType;
  aiDecision?: AiDecision;
  createdAt: string;
  updatedAt: string;
}
