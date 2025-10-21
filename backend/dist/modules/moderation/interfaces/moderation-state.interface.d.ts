import { ContentType, ModerationDecision, AIProvider } from "../../../common/constants";
export type ContentClassification = "safe" | "flagged" | "harmful";
export interface AnalysisResult {
    isSafe: boolean;
    concerns: string[];
    severity: "low" | "medium" | "high";
    detailedReason?: string;
}
export interface ModerationState {
    content: string;
    contentType: ContentType;
    analysisResult?: AnalysisResult;
    classification?: ContentClassification;
    decision?: ModerationDecision;
    reasoning?: string;
    visualizationUrl?: string;
    needsVisualization?: boolean;
    aiProvider?: AIProvider;
}
