import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ModerationAgent } from "./agents/moderation.agent";
import { ContentType, AIProvider } from "../../common/constants";
import { ModerationResult } from "../../common/interfaces";

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private agent: ModerationAgent;

  constructor(private configService: ConfigService) {
    const openaiKey = this.configService.get<string>("openai.apiKey");
    const geminiKey = this.configService.get<string>("gemini.apiKey");

    // Choose preferred provider (can be configured via environment)
    const preferredProvider = AIProvider.OPENAI; // Change to AIProvider.GEMINI to prefer Gemini

    this.agent = new ModerationAgent(openaiKey, geminiKey, preferredProvider);

    this.logger.log(
      `Moderation service initialized - Gemini: ${
        this.agent.isGeminiAvailable() ? "✅" : "❌"
      }`
    );
  }

  async moderateContent(
    content: string,
    contentType: ContentType
  ): Promise<ModerationResult> {
    this.logger.log(`Moderating ${contentType} content`);

    try {
      const result = await this.agent.moderate(content, contentType);

      return {
        decision: result.decision,
        reasoning: result.reasoning,
        classification: result.classification ? [result.classification] : [],
        analysisResult: result.analysisResult,
        visualizationUrl: result.visualizationUrl, // Include generated visualization
      };
    } catch (error) {
      this.logger.error("Moderation failed", error);
      throw error;
    }
  }
}
