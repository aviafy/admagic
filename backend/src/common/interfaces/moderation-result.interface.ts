import { ModerationDecision, AIProvider } from '../constants';

export interface ModerationResult {
  decision: ModerationDecision;
  reasoning: string;
  classification: string[];
  analysisResult: any;
  visualizationUrl?: string; // Generated image URL for flagged content
  aiProvider?: AIProvider; // Which AI provider was used
}

export interface AIDecision {
  decision: ModerationDecision;
  reasoning: string;
  classification: string[];
  analysisResult: any;
  visualizationUrl?: string; // Generated image URL for flagged content
  aiProvider?: AIProvider; // Which AI provider was used
}
