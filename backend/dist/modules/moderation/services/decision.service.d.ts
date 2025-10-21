import { ModerationDecision, AIProvider } from "../../../common/constants";
import { AnalysisResult } from "../interfaces";
export declare class DecisionService {
    private readonly logger;
    makeDecision(classification: "safe" | "flagged" | "harmful", analysisResult: AnalysisResult, aiProvider: AIProvider): {
        decision: ModerationDecision;
        reasoning: string;
    };
    classifyContent(analysisResult: AnalysisResult): "safe" | "flagged" | "harmful";
    private buildApprovedMessage;
    private buildFlaggedMessage;
    private buildRejectedMessage;
    private getViolationSpecificMessage;
    private containsAdultContent;
    private containsViolence;
    private containsMinorRelatedContent;
}
