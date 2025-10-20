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
const constants_1 = require("../../common/constants");
let ModerationService = ModerationService_1 = class ModerationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ModerationService_1.name);
        const openaiKey = this.configService.get("openai.apiKey");
        const geminiKey = this.configService.get("gemini.apiKey");
        const preferredProvider = constants_1.AIProvider.OPENAI;
        this.agent = new moderation_agent_1.ModerationAgent(openaiKey, geminiKey, preferredProvider);
        this.logger.log(`Moderation service initialized - Gemini: ${this.agent.isGeminiAvailable() ? "✅" : "❌"}`);
    }
    async moderateContent(content, contentType) {
        this.logger.log(`Moderating ${contentType} content`);
        try {
            const result = await this.agent.moderate(content, contentType);
            return {
                decision: result.decision,
                reasoning: result.reasoning,
                classification: result.classification ? [result.classification] : [],
                analysisResult: result.analysisResult,
                visualizationUrl: result.visualizationUrl,
            };
        }
        catch (error) {
            this.logger.error("Moderation failed", error);
            throw error;
        }
    }
};
exports.ModerationService = ModerationService;
exports.ModerationService = ModerationService = ModerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ModerationService);
//# sourceMappingURL=moderation.service.js.map