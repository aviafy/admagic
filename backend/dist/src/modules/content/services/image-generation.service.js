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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ImageGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageGenerationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let ImageGenerationService = ImageGenerationService_1 = class ImageGenerationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ImageGenerationService_1.name);
        const apiKey = this.configService.get("openai.apiKey");
        if (!apiKey) {
            throw new Error("OpenAI API key is required for image generation");
        }
        this.openai = new openai_1.default({ apiKey });
        this.logger.log("Image generation service initialized with DALL-E 3");
    }
    async generateImage(dto) {
        const { prompt, size = "1024x1024", quality = "standard" } = dto;
        this.logger.log(`Generating image with DALL-E 3: "${prompt.substring(0, 50)}..."`);
        try {
            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt,
                n: 1,
                size,
                quality,
                response_format: "url",
            });
            const imageUrl = response.data?.[0]?.url;
            const revisedPrompt = response.data?.[0]?.revised_prompt;
            if (!imageUrl) {
                throw new Error("No image URL returned from DALL-E");
            }
            this.logger.log("Image generated successfully");
            return { imageUrl, revisedPrompt };
        }
        catch (error) {
            this.logger.error("Failed to generate image with DALL-E 3", error);
            if (error?.code === 'content_policy_violation') {
                throw new Error("Your prompt was rejected by OpenAI's safety system. Please try a different prompt that follows content guidelines.");
            }
            if (error?.status === 429) {
                throw new Error("Rate limit exceeded. Please try again in a few moments.");
            }
            throw error;
        }
    }
};
exports.ImageGenerationService = ImageGenerationService;
exports.ImageGenerationService = ImageGenerationService = ImageGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ImageGenerationService);
//# sourceMappingURL=image-generation.service.js.map