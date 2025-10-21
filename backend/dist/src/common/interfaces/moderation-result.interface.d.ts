import { ModerationDecision, AIProvider } from '../constants';
export interface ModerationResult {
    decision: ModerationDecision;
    reasoning: string;
    classification: string[];
    analysisResult: any;
    visualizationUrl?: string;
    aiProvider?: AIProvider;
}
export interface AIDecision {
    decision: ModerationDecision;
    reasoning: string;
    classification: string[];
    analysisResult: any;
    visualizationUrl?: string;
    aiProvider?: AIProvider;
}
