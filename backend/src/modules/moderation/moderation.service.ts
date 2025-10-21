import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ModerationAgent } from "./agents/moderation.agent";
import { ModerationCacheService } from "./cache/moderation-cache.service";
import { ContentType, AIProvider } from "../../common/constants";
import { ModerationResult } from "../../common/interfaces";

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private agent: ModerationAgent;

  // Cost tracking
  private costs = {
    totalRequests: 0,
    cachedRequests: 0,
    aiRequests: 0,
  };

  constructor(
    private configService: ConfigService,
    private cacheService: ModerationCacheService,
  ) {
    const openaiKey = this.configService.get<string>("openai.apiKey");
    const geminiKey = this.configService.get<string>("gemini.apiKey");

    if (!openaiKey) {
      throw new Error("OpenAI API key is required");
    }

    // Choose preferred provider (can be configured via environment)
    const preferredProvider = AIProvider.OPENAI; // Change to AIProvider.GEMINI to prefer Gemini

    this.agent = new ModerationAgent(openaiKey, geminiKey, preferredProvider);

    this.logger.log(
      `Moderation service initialized - Gemini: ${
        this.agent.isGeminiAvailable() ? "✅" : "❌"
      }`
    );

    // Log cache stats every 5 minutes
    setInterval(() => {
      this.logPerformanceStats();
    }, 5 * 60 * 1000);
  }

  async moderateContent(
    content: string,
    contentType: ContentType
  ): Promise<ModerationResult> {
    this.costs.totalRequests++;
    this.logger.log(`Moderating ${contentType} content`);

    try {
      // Check cache first
      const cachedResult = await this.cacheService.get(content, contentType);
      if (cachedResult) {
        this.costs.cachedRequests++;
        this.logger.log(`Using cached moderation result (saved AI API call)`);
        return cachedResult;
      }

      // No cache hit - call AI
      this.costs.aiRequests++;
      const result = await this.agent.moderate(content, contentType);

      if (!result.decision || !result.reasoning) {
        throw new Error("Invalid moderation result: missing decision or reasoning");
      }

      const moderationResult: ModerationResult = {
        decision: result.decision,
        reasoning: result.reasoning,
        classification: result.classification ? [result.classification] : [],
        analysisResult: result.analysisResult,
        visualizationUrl: result.visualizationUrl,
      };

      // Cache the result for future requests
      await this.cacheService.set(content, contentType, moderationResult);

      return moderationResult;
    } catch (error) {
      this.logger.error("Moderation failed", error);
      throw error;
    }
  }

  /**
   * Get cost and performance statistics
   */
  getStats() {
    const cacheHitRate = this.costs.totalRequests > 0
      ? ((this.costs.cachedRequests / this.costs.totalRequests) * 100).toFixed(2)
      : '0.00';

    const estimatedCostSavings = this.costs.cachedRequests * 0.005; // ~$0.005 per cached request

    return {
      ...this.costs,
      cacheHitRate: `${cacheHitRate}%`,
      estimatedCostSavings: `$${estimatedCostSavings.toFixed(2)}`,
      cacheStats: this.cacheService.getStats(),
    };
  }

  /**
   * Log performance and cost statistics
   */
  private logPerformanceStats(): void {
    const stats = this.getStats();
    this.logger.log(
      `Performance Stats - Total: ${stats.totalRequests}, ` +
      `Cached: ${stats.cachedRequests}, AI Calls: ${stats.aiRequests}, ` +
      `Cache Hit Rate: ${stats.cacheHitRate}, ` +
      `Est. Cost Savings: ${stats.estimatedCostSavings}`,
    );
    this.cacheService.logStats();
  }
}
