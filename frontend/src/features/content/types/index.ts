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
  aiProvider?: 'openai' | 'gemini'; // Which AI provider was used
}

export interface AnalysisResult {
  isSafe: boolean;
  concerns: string[];
  severity: SeverityLevel;
}

export interface SubmitContentDto {
  contentType: ContentType;
  contentText?: string;
  contentUrl?: string;
  aiProvider?: 'openai' | 'gemini';
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
