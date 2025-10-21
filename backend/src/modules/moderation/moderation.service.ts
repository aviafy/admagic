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
    private cacheService: ModerationCacheService
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
    contentType: ContentType,
    preferredProvider?: AIProvider
  ): Promise<ModerationResult> {
    this.costs.totalRequests++;
    this.logger.log(
      `🟣 [ModerationService] Moderating ${contentType} content with provider: ${
        preferredProvider || "default (OpenAI)"
      }`
    );

    try {
      // Check cache first (cache key includes provider preference)
      const cacheKey = preferredProvider
        ? `${content}:${preferredProvider}`
        : content;
      const cachedResult = await this.cacheService.get(cacheKey, contentType);
      if (cachedResult) {
        this.costs.cachedRequests++;
        this.logger.log(
          `💾 [ModerationService] Using cached moderation result (saved AI API call) - Used provider: ${cachedResult.aiProvider}`
        );
        return cachedResult;
      }

      // No cache hit - call AI with preferred provider
      this.costs.aiRequests++;
      this.logger.log(
        `🔧 [ModerationService] No cache hit. Creating/using agent with provider: ${
          preferredProvider || AIProvider.OPENAI
        }`
      );

      // Create a new agent instance if a different provider is preferred
      let agentToUse = this.agent;
      if (preferredProvider && preferredProvider !== AIProvider.OPENAI) {
        this.logger.log(
          `⚡ [ModerationService] Creating NEW agent instance for provider: ${preferredProvider}`
        );
        const openaiKey = this.configService.get<string>("openai.apiKey");
        const geminiKey = this.configService.get<string>("gemini.apiKey");
        agentToUse = new ModerationAgent(
          openaiKey!,
          geminiKey,
          preferredProvider
        );
        this.logger.log(
          `✅ [ModerationService] New agent created with preferred provider: ${preferredProvider}`
        );
      } else {
        this.logger.log(
          `♻️  [ModerationService] Using existing default agent (OpenAI)`
        );
      }

      this.logger.log(`🚀 [ModerationService] Calling agent.moderate()...`);
      const result = await agentToUse.moderate(content, contentType);
      this.logger.log(
        `✅ [ModerationService] Agent returned result with provider: ${result.aiProvider}`
      );

      if (!result.decision || !result.reasoning) {
        throw new Error(
          "Invalid moderation result: missing decision or reasoning"
        );
      }

      const moderationResult: ModerationResult = {
        decision: result.decision,
        reasoning: result.reasoning,
        classification: result.classification ? [result.classification] : [],
        analysisResult: result.analysisResult,
        visualizationUrl: result.visualizationUrl,
        aiProvider: result.aiProvider || preferredProvider || AIProvider.OPENAI,
      };

      // Cache the result for future requests (include provider in cache key)
      await this.cacheService.set(cacheKey, contentType, moderationResult);

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
    const cacheHitRate =
      this.costs.totalRequests > 0
        ? (
            (this.costs.cachedRequests / this.costs.totalRequests) *
            100
          ).toFixed(2)
        : "0.00";

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
        `Est. Cost Savings: ${stats.estimatedCostSavings}`
    );
    this.cacheService.logStats();
  }
}
