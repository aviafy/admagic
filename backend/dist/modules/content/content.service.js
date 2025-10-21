"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const moderation_service_1 = require("../moderation/moderation.service");
const constants_1 = require("../../common/constants");
let ContentService = ContentService_1 = class ContentService {
    constructor(databaseService, moderationService) {
        this.databaseService = databaseService;
        this.moderationService = moderationService;
        this.logger = new common_1.Logger(ContentService_1.name);
        this.logger.log("Content service initialized");
    }
    async submitContent(userId, submitDto) {
        this.logger.log(`Submitting content for authenticated user: ${userId}`);
        try {
            const submission = await this.databaseService.createSubmission({
                userId: userId,
                contentType: submitDto.contentType,
                contentText: submitDto.contentText,
                contentUrl: submitDto.contentUrl,
            });
            await this.databaseService.createAuditLog(submission.id, constants_1.AuditLogAction.SUBMISSION_CREATED, { contentType: submitDto.contentType });
            this.processModeration(submission.id, submitDto).catch((error) => {
                this.logger.error(`Moderation processing failed for ${submission.id}`, error);
            });
            return {
                submissionId: submission.id,
                status: constants_1.SubmissionStatus.PENDING,
                message: "Content submitted for moderation",
            };
        }
        catch (error) {
            this.logger.error("Failed to submit content", error);
            throw error;
        }
    }
    async processModeration(submissionId, submitDto) {
        this.logger.log(`Processing moderation for submission: ${submissionId}`);
        this.logger.log(`Requested AI provider: ${submitDto.aiProvider || "default (OpenAI)"}`);
        try {
            const content = submitDto.contentText || submitDto.contentUrl || "";
            this.logger.log(`Calling moderationService with provider: ${submitDto.aiProvider}`);
            const result = await this.moderationService.moderateContent(content, submitDto.contentType, submitDto.aiProvider);
            this.logger.log(`Moderation result received - Decision: ${result.decision}, Used provider: ${result.aiProvider}`);
            const statusMap = {
                [constants_1.ModerationDecision.APPROVED]: constants_1.SubmissionStatus.APPROVED,
                [constants_1.ModerationDecision.FLAGGED]: constants_1.SubmissionStatus.FLAGGED,
                [constants_1.ModerationDecision.REJECTED]: constants_1.SubmissionStatus.REJECTED,
            };
            const status = statusMap[result.decision];
            await this.databaseService.updateSubmission(submissionId, {
                status,
                aiDecision: {
                    decision: result.decision,
                    reasoning: result.reasoning,
                    classification: result.classification,
                    analysisResult: result.analysisResult,
                    visualizationUrl: result.visualizationUrl,
                    aiProvider: result.aiProvider,
                },
            });
            await this.databaseService.createAuditLog(submissionId, constants_1.AuditLogAction.MODERATION_COMPLETED, {
                decision: result.decision,
                reasoning: result.reasoning,
            });
            this.logger.log(`Moderation completed for ${submissionId}: ${result.decision}`);
        }
        catch (error) {
            this.logger.error(`Moderation error for ${submissionId}`, error);
            await this.databaseService.createAuditLog(submissionId, constants_1.AuditLogAction.MODERATION_ERROR, {
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    async getSubmissionStatus(id) {
        this.logger.log(`Getting submission status: ${id}`);
        try {
            const submission = await this.databaseService.getSubmission(id);
            return {
                id: submission.id,
                status: submission.status,
                contentType: submission.content_type,
                aiDecision: submission.ai_decision,
                createdAt: submission.created_at,
                updatedAt: submission.updated_at,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get submission ${id}`, error);
            throw new common_1.NotFoundException(`Submission with ID ${id} not found`);
        }
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = ContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        moderation_service_1.ModerationService])
], ContentService);
//# sourceMappingURL=content.service.js.map