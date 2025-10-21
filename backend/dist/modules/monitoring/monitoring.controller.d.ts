import { MonitoringService } from './monitoring.service';
export declare class MonitoringController {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    health(): {
        status: string;
        timestamp: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
    };
    readiness(): {
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
    metrics(): {
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
}
