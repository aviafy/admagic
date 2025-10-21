import { ModerationDecision } from '../constants';
export interface ModerationResult {
    decision: ModerationDecision;
    reasoning: string;
    classification: string[];
    analysisResult: any;
    visualizationUrl?: string;
}
export interface AIDecision {
    decision: ModerationDecision;
    reasoning: string;
    classification: string[];
    analysisResult: any;
    visualizationUrl?: string;
}
