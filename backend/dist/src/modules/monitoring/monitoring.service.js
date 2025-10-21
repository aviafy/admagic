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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const moderation_service_1 = require("../moderation/moderation.service");
const database_service_1 = require("../database/database.service");
let MonitoringService = class MonitoringService {
    constructor(moderationService, databaseService) {
        this.moderationService = moderationService;
        this.databaseService = databaseService;
    }
    getReadinessStatus() {
        const checks = {
            database: this.checkDatabase(),
            moderation: this.checkModerationService(),
        };
        const isReady = Object.values(checks).every((check) => check.status === 'ok');
        return {
            status: isReady ? 'ready' : 'not_ready',
            timestamp: new Date().toISOString(),
            checks,
        };
    }
    getMetrics() {
        return {
            timestamp: new Date().toISOString(),
            moderation: this.moderationService.getStats(),
            process: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
            },
        };
    }
    checkDatabase() {
        try {
            const client = this.databaseService.getClient();
            return {
                status: 'ok',
                message: 'Database connection active',
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    checkModerationService() {
        try {
            return {
                status: 'ok',
                message: 'Moderation service active',
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [moderation_service_1.ModerationService,
        database_service_1.DatabaseService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map