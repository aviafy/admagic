import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { ContentService } from './content.service';
import { SubmitContentDto, SubmitResponseDto, SubmissionResponseDto } from './dto';
export declare class ContentController {
    private readonly contentService;
    private readonly logger;
    constructor(contentService: ContentService);
    submitContent(user: AuthenticatedUser, submitDto: SubmitContentDto): Promise<SubmitResponseDto>;
    getStatus(user: AuthenticatedUser, id: string): Promise<SubmissionResponseDto>;
}
