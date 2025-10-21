import { ConfigService } from "@nestjs/config";
import { ModerationCacheService } from "./cache/moderation-cache.service";
import { ContentType } from "../../common/constants";
import { ModerationResult } from "../../common/interfaces";
export declare class ModerationService {
    private configService;
    private cacheService;
    private readonly logger;
    private agent;
    private costs;
    constructor(configService: ConfigService, cacheService: ModerationCacheService);
    moderateContent(content: string, contentType: ContentType): Promise<ModerationResult>;
    getStats(): {
        cacheHitRate: string;
        estimatedCostSavings: string;
        cacheStats: {
            total: number;
            hitRate: string;
            hits: number;
            misses: number;
            saves: number;
        };
        totalRequests: number;
        cachedRequests: number;
        aiRequests: number;
    };
    private logPerformanceStats;
}
