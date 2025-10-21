import { ConfigService } from "@nestjs/config";
import { GenerateImageDto } from "../dto/generate-image.dto";
export declare class ImageGenerationService {
    private configService;
    private readonly logger;
    private readonly openai;
    constructor(configService: ConfigService);
    generateImage(dto: GenerateImageDto): Promise<{
        imageUrl: string;
        revisedPrompt?: string;
    }>;
}
