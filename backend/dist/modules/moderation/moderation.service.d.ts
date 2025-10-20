import { ConfigService } from "@nestjs/config";
import { ContentType } from "../../common/constants";
import { ModerationResult } from "../../common/interfaces";
export declare class ModerationService {
    private configService;
    private readonly logger;
    private agent;
    constructor(configService: ConfigService);
    moderateContent(content: string, contentType: ContentType): Promise<ModerationResult>;
}
