"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ModerationCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const crypto_1 = require("crypto");
let ModerationCacheService = ModerationCacheService_1 = class ModerationCacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(ModerationCacheService_1.name);
        this.CACHE_TTL = 3600;
        this.CACHE_PREFIX = 'moderation:';
        this.stats = {
            hits: 0,
            misses: 0,
            saves: 0,
        };
    }
    generateCacheKey(content, contentType) {
        const hash = (0, crypto_1.createHash)('sha256')
            .update(`${contentType}:${content}`)
            .digest('hex');
        return `${this.CACHE_PREFIX}${hash}`;
    }
    async get(content, contentType) {
        const key = this.generateCacheKey(content, contentType);
        try {
            const cached = await this.cacheManager.get(key);
            if (cached) {
                this.stats.hits++;
                this.logger.debug(`Cache HIT for key: ${key.substring(0, 20)}...`);
                return cached;
            }
            this.stats.misses++;
            this.logger.debug(`Cache MISS for key: ${key.substring(0, 20)}...`);
            return null;
        }
        catch (error) {
            this.logger.error('Cache get error:', error);
            return null;
        }
    }
    async set(content, contentType, result) {
        const key = this.generateCacheKey(content, contentType);
        try {
            await this.cacheManager.set(key, result, this.CACHE_TTL * 1000);
            this.stats.saves++;
            this.logger.debug(`Cached result for key: ${key.substring(0, 20)}...`);
        }
        catch (error) {
            this.logger.error('Cache set error:', error);
        }
    }
    async invalidate(content, contentType) {
        const key = this.generateCacheKey(content, contentType);
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Invalidated cache for key: ${key.substring(0, 20)}...`);
        }
        catch (error) {
            this.logger.error('Cache invalidation error:', error);
        }
    }
    async clearAll() {
        try {
            this.logger.warn('Clear all not implemented for cache-manager v6');
        }
        catch (error) {
            this.logger.error('Cache clear error:', error);
        }
    }
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : '0.00';
        return {
            ...this.stats,
            total,
            hitRate: `${hitRate}%`,
        };
    }
    logStats() {
        const stats = this.getStats();
        this.logger.log(`Cache Stats - Hits: ${stats.hits}, Misses: ${stats.misses}, ` +
            `Hit Rate: ${stats.hitRate}, Total Saves: ${stats.saves}`);
    }
};
exports.ModerationCacheService = ModerationCacheService;
exports.ModerationCacheService = ModerationCacheService = ModerationCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], ModerationCacheService);
//# sourceMappingURL=moderation-cache.service.js.map