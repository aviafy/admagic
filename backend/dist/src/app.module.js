"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_2 = require("./config");
const auth_module_1 = require("./modules/auth/auth.module");
const database_module_1 = require("./modules/database/database.module");
const content_module_1 = require("./modules/content/content.module");
const moderation_module_1 = require("./modules/moderation/moderation.module");
const monitoring_module_1 = require("./modules/monitoring/monitoring.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.configuration],
                validationSchema: config_2.validationSchema,
                validationOptions: {
                    allowUnknown: true,
                    abortEarly: false,
                },
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: 3600,
                max: 100,
            }),
            auth_module_1.AuthModule,
            database_module_1.DatabaseModule,
            moderation_module_1.ModerationModule,
            content_module_1.ContentModule,
            monitoring_module_1.MonitoringModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map