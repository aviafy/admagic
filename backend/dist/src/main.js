"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const filters_1 = require("./common/filters");
const interceptors_1 = require("./common/interceptors");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
        bodyParser: true,
    });
    const configService = app.get(config_1.ConfigService);
    const corsOrigin = configService.get('cors.origin');
    app.enableCors({
        origin: corsOrigin,
        credentials: configService.get('cors.credentials'),
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        disableErrorMessages: false,
        validationError: {
            target: false,
            value: true,
        },
    }));
    app.useGlobalFilters(new filters_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new interceptors_1.LoggingInterceptor());
    const port = configService.get('port') || 3001;
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Environment: ${configService.get('environment')}`);
    logger.log(`CORS enabled for: ${corsOrigin}`);
}
bootstrap();
//# sourceMappingURL=main.js.map