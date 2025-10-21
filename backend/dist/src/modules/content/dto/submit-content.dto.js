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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitContentDto = void 0;
const class_validator_1 = require("class-validator");
const constants_1 = require("../../../common/constants");
class SubmitContentDto {
}
exports.SubmitContentDto = SubmitContentDto;
__decorate([
    (0, class_validator_1.IsEnum)(constants_1.ContentType, {
        message: 'Content type must be either text or image',
    }),
    __metadata("design:type", String)
], SubmitContentDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.contentType === constants_1.ContentType.TEXT),
    (0, class_validator_1.IsNotEmpty)({ message: 'Content text is required for text submissions' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10000, { message: 'Text content cannot exceed 10000 characters' }),
    __metadata("design:type", String)
], SubmitContentDto.prototype, "contentText", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.contentType === constants_1.ContentType.IMAGE),
    (0, class_validator_1.IsNotEmpty)({ message: 'Content URL is required for image submissions' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^(https?:\/\/.+|data:image\/.+;base64,.+)$/, { message: 'Content URL must be a valid URL (http/https) or base64 data URL (data:image/...)' }),
    __metadata("design:type", String)
], SubmitContentDto.prototype, "contentUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(constants_1.AIProvider, {
        message: 'AI provider must be either openai or gemini',
    }),
    __metadata("design:type", String)
], SubmitContentDto.prototype, "aiProvider", void 0);
//# sourceMappingURL=submit-content.dto.js.map