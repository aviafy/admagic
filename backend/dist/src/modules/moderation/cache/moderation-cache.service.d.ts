import { Cache } from 'cache-manager';
import { ModerationResult } from '../../../common/interfaces';
import { ContentType } from '../../../common/constants';
export declare class ModerationCacheService {
    private cacheManager;
    private readonly logger;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    private stats;
    constructor(cacheManager: Cache);
    private generateCacheKey;
    get(content: string, contentType: ContentType): Promise<ModerationResult | null>;
    set(content: string, contentType: ContentType, result: ModerationResult): Promise<void>;
    invalidate(content: string, contentType: ContentType): Promise<void>;
    clearAll(): Promise<void>;
    getStats(): {
        total: number;
        hitRate: string;
        hits: number;
        misses: number;
        saves: number;
    };
    logStats(): void;
}
