import {
  ContentType,
  ModerationDecision,
  AIProvider,
} from "../../../common/constants";

export type ContentClassification = "safe" | "flagged" | "harmful";

export interface AnalysisResult {
  isSafe: boolean;
  concerns: string[];
  severity: "low" | "medium" | "high";
  detailedReason?: string; // Detailed explanation for users
}

export interface ModerationState {
  content: string;
  contentType: ContentType;
  analysisResult?: AnalysisResult;
  classification?: ContentClassification;
  decision?: ModerationDecision;
  reasoning?: string;
  visualizationUrl?: string; // Generated image URL for flagged content
  needsVisualization?: boolean; // Flag to determine if visualization should be generated
  aiProvider?: AIProvider; // AI provider used for analysis
}
