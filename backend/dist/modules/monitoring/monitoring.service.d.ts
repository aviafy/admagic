import { ModerationService } from '../moderation/moderation.service';
import { DatabaseService } from '../database/database.service';
export declare class MonitoringService {
    private moderationService;
    private databaseService;
    constructor(moderationService: ModerationService, databaseService: DatabaseService);
    getReadinessStatus(): {
        status: string;
        timestamp: string;
        checks: {
            database: {
                status: string;
                message: string;
            };
            moderation: {
                status: string;
                message: string;
            };
        };
    };
    getMetrics(): {
        timestamp: string;
        moderation: {
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
        process: {
            uptime: number;
            memory: NodeJS.MemoryUsage;
            cpu: NodeJS.CpuUsage;
        };
    };
    private checkDatabase;
    private checkModerationService;
}
