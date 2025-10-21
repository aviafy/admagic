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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ContentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const content_service_1 = require("./content.service");
const dto_1 = require("./dto");
const image_generation_service_1 = require("./services/image-generation.service");
let ContentController = ContentController_1 = class ContentController {
    constructor(contentService, imageGenerationService) {
        this.contentService = contentService;
        this.imageGenerationService = imageGenerationService;
        this.logger = new common_1.Logger(ContentController_1.name);
    }
    async submitContent(user, submitDto) {
        this.logger.log(`🔵 [Controller] Received content submission from user: ${user.userId} with AI provider: ${submitDto.aiProvider || "default"}`);
        this.logger.debug(`📦 [Controller] SubmitDto:`, JSON.stringify(submitDto));
        return await this.contentService.submitContent(user.userId, submitDto);
    }
    async getStatus(user, id) {
        this.logger.log(`User ${user.userId} checking status for submission: ${id}`);
        return await this.contentService.getSubmissionStatus(id);
    }
    async generateImage(user, generateDto) {
        this.logger.log(`User ${user.userId} generating image with prompt: "${generateDto.prompt.substring(0, 50)}..."`);
        return await this.imageGenerationService.generateImage(generateDto);
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Post)("submit"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.SubmitContentDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "submitContent", null);
__decorate([
    (0, common_1.Get)("status/:id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)("generate-image"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.GenerateImageDto]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "generateImage", null);
exports.ContentController = ContentController = ContentController_1 = __decorate([
    (0, common_1.Controller)("content"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [content_service_1.ContentService,
        image_generation_service_1.ImageGenerationService])
], ContentController);
//# sourceMappingURL=content.controller.js.map