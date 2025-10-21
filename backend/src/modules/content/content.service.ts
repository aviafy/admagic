import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { ModerationService } from "../moderation/moderation.service";
import {
  SubmitContentDto,
  SubmitResponseDto,
  SubmissionResponseDto,
} from "./dto";
import {
  SubmissionStatus,
  AuditLogAction,
  ModerationDecision,
  ContentType,
} from "../../common/constants";

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private databaseService: DatabaseService,
    private moderationService: ModerationService
  ) {
    this.logger.log("Content service initialized");
  }

  async submitContent(
    userId: string,
    submitDto: SubmitContentDto
  ): Promise<SubmitResponseDto> {
    this.logger.log(`Submitting content for authenticated user: ${userId}`);

    try {
      // Create submission in database using authenticated user ID
      const submission = await this.databaseService.createSubmission({
        userId: userId, // From JWT token, not request body
        contentType: submitDto.contentType,
        contentText: submitDto.contentText,
        contentUrl: submitDto.contentUrl,
      });

      // Log submission
      await this.databaseService.createAuditLog(
        submission.id,
        AuditLogAction.SUBMISSION_CREATED,
        { contentType: submitDto.contentType }
      );

      // Start moderation process (async)
      this.processModeration(submission.id, submitDto).catch((error) => {
        this.logger.error(
          `Moderation processing failed for ${submission.id}`,
          error
        );
      });

      return {
        submissionId: submission.id,
        status: SubmissionStatus.PENDING,
        message: "Content submitted for moderation",
      };
    } catch (error) {
      this.logger.error("Failed to submit content", error);
      throw error;
    }
  }

  private async processModeration(
    submissionId: string,
    submitDto: SubmitContentDto
  ): Promise<void> {
    this.logger.log(
      `🟢 [ContentService] Processing moderation for submission: ${submissionId}`
    );
    this.logger.log(
      `🤖 [ContentService] Requested AI provider: ${
        submitDto.aiProvider || "default (OpenAI)"
      }`
    );

    try {
      // Get content to moderate
      const content = submitDto.contentText || submitDto.contentUrl || "";

      // Run moderation agent with preferred AI provider
      this.logger.log(
        `📤 [ContentService] Calling moderationService with provider: ${submitDto.aiProvider}`
      );
      const result = await this.moderationService.moderateContent(
        content,
        submitDto.contentType,
        submitDto.aiProvider
      );
      this.logger.log(
        `📥 [ContentService] Moderation result received - Decision: ${result.decision}, Used provider: ${result.aiProvider}`
      );

      // Map decision to status
      const statusMap: Record<ModerationDecision, SubmissionStatus> = {
        [ModerationDecision.APPROVED]: SubmissionStatus.APPROVED,
        [ModerationDecision.FLAGGED]: SubmissionStatus.FLAGGED,
        [ModerationDecision.REJECTED]: SubmissionStatus.REJECTED,
      };

      const status = statusMap[result.decision];

      // Update submission with decision
      await this.databaseService.updateSubmission(submissionId, {
        status,
        aiDecision: {
          decision: result.decision,
          reasoning: result.reasoning,
          classification: result.classification,
          analysisResult: result.analysisResult,
          visualizationUrl: result.visualizationUrl, // Store generated visualization
          aiProvider: result.aiProvider, // Store which AI provider was used
        },
      });

      // Log decision
      await this.databaseService.createAuditLog(
        submissionId,
        AuditLogAction.MODERATION_COMPLETED,
        {
          decision: result.decision,
          reasoning: result.reasoning,
        }
      );

      this.logger.log(
        `Moderation completed for ${submissionId}: ${result.decision}`
      );
    } catch (error) {
      this.logger.error(`Moderation error for ${submissionId}`, error);
      await this.databaseService.createAuditLog(
        submissionId,
        AuditLogAction.MODERATION_ERROR,
        {
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
    }
  }

  async getSubmissionStatus(id: string): Promise<SubmissionResponseDto> {
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
    } catch (error) {
      this.logger.error(`Failed to get submission ${id}`, error);
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
  }
}
