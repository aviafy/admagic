import { AuthenticatedUser } from "../auth/decorators/current-user.decorator";
import { ContentService } from "./content.service";
import { SubmitContentDto, SubmitResponseDto, SubmissionResponseDto, GenerateImageDto, GenerateImageResponseDto } from "./dto";
import { ImageGenerationService } from "./services/image-generation.service";
export declare class ContentController {
    private readonly contentService;
    private readonly imageGenerationService;
    private readonly logger;
    constructor(contentService: ContentService, imageGenerationService: ImageGenerationService);
    submitContent(user: AuthenticatedUser, submitDto: SubmitContentDto): Promise<SubmitResponseDto>;
    getStatus(user: AuthenticatedUser, id: string): Promise<SubmissionResponseDto>;
    generateImage(user: AuthenticatedUser, generateDto: GenerateImageDto): Promise<GenerateImageResponseDto>;
}
