import { ContentService } from './content.service';
import { SubmitContentDto, SubmitResponseDto, SubmissionResponseDto } from './dto';
export declare class ContentController {
    private readonly contentService;
    private readonly logger;
    constructor(contentService: ContentService);
    submitContent(submitDto: SubmitContentDto): Promise<SubmitResponseDto>;
    getStatus(id: string): Promise<SubmissionResponseDto>;
}
