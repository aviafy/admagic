import { Logger } from "@nestjs/common";
import { ModerationDecision, AIProvider } from "../../../common/constants";
import { ModerationState, AnalysisResult } from "../interfaces";

/**
 * Service responsible for making final moderation decisions
 * and generating user-facing reasoning messages
 */
export class DecisionService {
  private readonly logger = new Logger(DecisionService.name);

  /**
   * Makes final moderation decision based on classification
   */
  makeDecision(
    classification: "safe" | "flagged" | "harmful",
    analysisResult: AnalysisResult,
    aiProvider: AIProvider
  ): { decision: ModerationDecision; reasoning: string } {
    this.logger.debug(`Making decision for classification: ${classification}`);

    let decision: ModerationDecision;
    let reasoning: string;

    switch (classification) {
      case "safe":
        decision = ModerationDecision.APPROVED;
        reasoning = this.buildApprovedMessage(aiProvider);
        break;

      case "flagged":
        decision = ModerationDecision.FLAGGED;
        reasoning = this.buildFlaggedMessage(analysisResult, aiProvider);
        break;

      case "harmful":
        decision = ModerationDecision.REJECTED;
        reasoning = this.buildRejectedMessage(analysisResult, aiProvider);
        break;
    }

    this.logger.log(`Decision: ${decision}`);
    return { decision, reasoning };
  }

  /**
   * Classifies content based on analysis results
   */
  classifyContent(
    analysisResult: AnalysisResult
  ): "safe" | "flagged" | "harmful" {
    if (analysisResult.isSafe) {
      return "safe";
    } else if (analysisResult.severity === "high") {
      return "harmful";
    } else {
      return "flagged";
    }
  }

  /**
   * Builds approval message
   */
  private buildApprovedMessage(aiProvider: AIProvider): string {
    return `Content approved. Your content meets all community guidelines and safety standards.`;
  }

  /**
   * Builds flagged content message
   */
  private buildFlaggedMessage(
    analysisResult: AnalysisResult,
    aiProvider: AIProvider
  ): string {
    const concernsList = analysisResult.concerns?.join(", ") || "Unknown";

    const userMessage =
      analysisResult.detailedReason ||
      `Your content has been flagged for manual review due to potential concerns: ${concernsList}. ` +
        `This content will be reviewed by our moderation team before publication.`;

    return `${userMessage}`;
  }

  /**
   * Builds rejection message with specific violation details
   */
  private buildRejectedMessage(
    analysisResult: AnalysisResult,
    aiProvider: AIProvider
  ): string {
    const concerns = analysisResult.concerns || [];
    const concernsList = concerns.join(", ") || "Unknown";

    let userMessage = analysisResult.detailedReason;

    if (!userMessage) {
      userMessage = this.getViolationSpecificMessage(concerns, concernsList);
    }

    return `${userMessage}`;
  }

  /**
   * Gets violation-specific message based on concern types
   */
  private getViolationSpecificMessage(
    concerns: string[],
    concernsList: string
  ): string {
    const concernsLower = concerns.map((c) => c.toLowerCase());

    if (this.containsAdultContent(concernsLower)) {
      return (
        `Your content has been rejected because it contains adult or sexually explicit material (+18). ` +
        `Our platform does not allow pornographic content, nudity, or sexually suggestive material. ` +
        `Specific concerns: ${concernsList}.`
      );
    }

    if (this.containsViolence(concernsLower)) {
      return (
        `Your content has been rejected because it contains graphic violence or harmful content. ` +
        `Our platform prohibits content depicting violence, gore, self-harm, or cruelty. ` +
        `Specific concerns: ${concernsList}.`
      );
    }

    if (this.containsMinorRelatedContent(concernsLower)) {
      return (
        `Your content has been rejected due to serious safety violations involving minors. ` +
        `This type of content is strictly prohibited and may be reported to authorities.`
      );
    }

    return (
      `Your content has been rejected because it violates our community guidelines. ` +
      `Specific violations: ${concernsList}. Please review our content policy and submit appropriate content.`
    );
  }

  /**
   * Checks if concerns contain adult/explicit content
   */
  private containsAdultContent(concernsLower: string[]): boolean {
    return concernsLower.some(
      (c) =>
        c.includes("adult") || c.includes("explicit") || c.includes("sexual")
    );
  }

  /**
   * Checks if concerns contain violence
   */
  private containsViolence(concernsLower: string[]): boolean {
    return concernsLower.some(
      (c) => c.includes("violence") || c.includes("gore") || c.includes("harm")
    );
  }

  /**
   * Checks if concerns contain minor-related violations
   */
  private containsMinorRelatedContent(concernsLower: string[]): boolean {
    return concernsLower.some(
      (c) => c.includes("child") || c.includes("minor")
    );
  }
}
