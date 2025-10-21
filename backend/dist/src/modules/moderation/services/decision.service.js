"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../../../common/constants");
class DecisionService {
    constructor() {
        this.logger = new common_1.Logger(DecisionService.name);
    }
    makeDecision(classification, analysisResult, aiProvider) {
        this.logger.debug(`Making decision for classification: ${classification}`);
        let decision;
        let reasoning;
        switch (classification) {
            case "safe":
                decision = constants_1.ModerationDecision.APPROVED;
                reasoning = this.buildApprovedMessage(aiProvider);
                break;
            case "flagged":
                decision = constants_1.ModerationDecision.FLAGGED;
                reasoning = this.buildFlaggedMessage(analysisResult, aiProvider);
                break;
            case "harmful":
                decision = constants_1.ModerationDecision.REJECTED;
                reasoning = this.buildRejectedMessage(analysisResult, aiProvider);
                break;
        }
        this.logger.log(`Decision: ${decision}`);
        return { decision, reasoning };
    }
    classifyContent(analysisResult) {
        if (analysisResult.isSafe) {
            return "safe";
        }
        else if (analysisResult.severity === "high") {
            return "harmful";
        }
        else {
            return "flagged";
        }
    }
    buildApprovedMessage(aiProvider) {
        return `✅ Content approved. Your content meets all community guidelines and safety standards. [AI: ${aiProvider}]`;
    }
    buildFlaggedMessage(analysisResult, aiProvider) {
        const concernsList = analysisResult.concerns?.join(", ") || "Unknown";
        const userMessage = analysisResult.detailedReason ||
            `Your content has been flagged for manual review due to potential concerns: ${concernsList}. ` +
                `This content will be reviewed by our moderation team before publication.`;
        return `⚠️ ${userMessage} [AI: ${aiProvider}]`;
    }
    buildRejectedMessage(analysisResult, aiProvider) {
        const concerns = analysisResult.concerns || [];
        const concernsList = concerns.join(", ") || "Unknown";
        let userMessage = analysisResult.detailedReason;
        if (!userMessage) {
            userMessage = this.getViolationSpecificMessage(concerns, concernsList);
        }
        return `❌ ${userMessage} [AI: ${aiProvider}]`;
    }
    getViolationSpecificMessage(concerns, concernsList) {
        const concernsLower = concerns.map((c) => c.toLowerCase());
        if (this.containsAdultContent(concernsLower)) {
            return (`Your content has been rejected because it contains adult or sexually explicit material (+18). ` +
                `Our platform does not allow pornographic content, nudity, or sexually suggestive material. ` +
                `Specific concerns: ${concernsList}.`);
        }
        if (this.containsViolence(concernsLower)) {
            return (`Your content has been rejected because it contains graphic violence or harmful content. ` +
                `Our platform prohibits content depicting violence, gore, self-harm, or cruelty. ` +
                `Specific concerns: ${concernsList}.`);
        }
        if (this.containsMinorRelatedContent(concernsLower)) {
            return (`Your content has been rejected due to serious safety violations involving minors. ` +
                `This type of content is strictly prohibited and may be reported to authorities.`);
        }
        return (`Your content has been rejected because it violates our community guidelines. ` +
            `Specific violations: ${concernsList}. Please review our content policy and submit appropriate content.`);
    }
    containsAdultContent(concernsLower) {
        return concernsLower.some((c) => c.includes("adult") || c.includes("explicit") || c.includes("sexual"));
    }
    containsViolence(concernsLower) {
        return concernsLower.some((c) => c.includes("violence") || c.includes("gore") || c.includes("harm"));
    }
    containsMinorRelatedContent(concernsLower) {
        return concernsLower.some((c) => c.includes("child") || c.includes("minor"));
    }
}
exports.DecisionService = DecisionService;
//# sourceMappingURL=decision.service.js.map