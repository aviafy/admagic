import { DatabaseService } from '../database/database.service';
import { ModerationService } from '../moderation/moderation.service';
import { SubmitContentDto, SubmitResponseDto, SubmissionResponseDto } from './dto';
export declare class ContentService {
    private databaseService;
    private moderationService;
    private readonly logger;
    constructor(databaseService: DatabaseService, moderationService: ModerationService);
    submitContent(userId: string, submitDto: SubmitContentDto): Promise<SubmitResponseDto>;
    private processModeration;
    getSubmissionStatus(id: string): Promise<SubmissionResponseDto>;
}
