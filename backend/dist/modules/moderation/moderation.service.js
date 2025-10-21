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
var ModerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const moderation_agent_1 = require("./agents/moderation.agent");
const moderation_cache_service_1 = require("./cache/moderation-cache.service");
const constants_1 = require("../../common/constants");
let ModerationService = ModerationService_1 = class ModerationService {
    constructor(configService, cacheService) {
        this.configService = configService;
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(ModerationService_1.name);
        this.costs = {
            totalRequests: 0,
            cachedRequests: 0,
            aiRequests: 0,
        };
        const openaiKey = this.configService.get("openai.apiKey");
        const geminiKey = this.configService.get("gemini.apiKey");
        if (!openaiKey) {
            throw new Error("OpenAI API key is required");
        }
        const preferredProvider = constants_1.AIProvider.OPENAI;
        this.agent = new moderation_agent_1.ModerationAgent(openaiKey, geminiKey, preferredProvider);
        this.logger.log(`Moderation service initialized - Gemini: ${this.agent.isGeminiAvailable() ? "Available" : "Not Available"}`);
        setInterval(() => {
            this.logPerformanceStats();
        }, 5 * 60 * 1000);
    }
    async moderateContent(content, contentType, preferredProvider) {
        this.costs.totalRequests++;
        this.logger.log(`Moderating ${contentType} content with provider: ${preferredProvider || "default (OpenAI)"}`);
        try {
            const cacheKey = preferredProvider
                ? `${content}:${preferredProvider}`
                : content;
            const cachedResult = await this.cacheService.get(cacheKey, contentType);
            if (cachedResult) {
                this.costs.cachedRequests++;
                this.logger.log(`Using cached moderation result (saved AI API call) - Used provider: ${cachedResult.aiProvider}`);
                return cachedResult;
            }
            this.costs.aiRequests++;
            this.logger.log(`No cache hit. Creating/using agent with provider: ${preferredProvider || constants_1.AIProvider.OPENAI}`);
            let agentToUse = this.agent;
            if (preferredProvider && preferredProvider !== constants_1.AIProvider.OPENAI) {
                this.logger.log(`Creating new agent instance for provider: ${preferredProvider}`);
                const openaiKey = this.configService.get("openai.apiKey");
                const geminiKey = this.configService.get("gemini.apiKey");
                agentToUse = new moderation_agent_1.ModerationAgent(openaiKey, geminiKey, preferredProvider);
                this.logger.log(`New agent created with preferred provider: ${preferredProvider}`);
            }
            else {
                this.logger.log(`Using existing default agent (OpenAI)`);
            }
            this.logger.log(`Calling agent.moderate()...`);
            const result = await agentToUse.moderate(content, contentType);
            this.logger.log(`Agent returned result with provider: ${result.aiProvider}`);
            if (!result.decision || !result.reasoning) {
                throw new Error("Invalid moderation result: missing decision or reasoning");
            }
            const moderationResult = {
                decision: result.decision,
                reasoning: result.reasoning,
                classification: result.classification ? [result.classification] : [],
                analysisResult: result.analysisResult,
                visualizationUrl: result.visualizationUrl,
                aiProvider: result.aiProvider || preferredProvider || constants_1.AIProvider.OPENAI,
            };
            await this.cacheService.set(cacheKey, contentType, moderationResult);
            return moderationResult;
        }
        catch (error) {
            this.logger.error("Moderation failed", error);
            throw error;
        }
    }
    getStats() {
        const cacheHitRate = this.costs.totalRequests > 0
            ? ((this.costs.cachedRequests / this.costs.totalRequests) *
                100).toFixed(2)
            : "0.00";
        const estimatedCostSavings = this.costs.cachedRequests * 0.005;
        return {
            ...this.costs,
            cacheHitRate: `${cacheHitRate}%`,
            estimatedCostSavings: `$${estimatedCostSavings.toFixed(2)}`,
            cacheStats: this.cacheService.getStats(),
        };
    }
    logPerformanceStats() {
        const stats = this.getStats();
        this.logger.log(`Performance Stats - Total: ${stats.totalRequests}, ` +
            `Cached: ${stats.cachedRequests}, AI Calls: ${stats.aiRequests}, ` +
            `Cache Hit Rate: ${stats.cacheHitRate}, ` +
            `Est. Cost Savings: ${stats.estimatedCostSavings}`);
        this.cacheService.logStats();
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = ModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        moderation_cache_service_1.ModerationCacheService])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map