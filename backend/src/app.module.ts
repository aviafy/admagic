import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { configuration, validationSchema } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/database/database.module';
import { ContentModule } from './modules/content/content.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    // Rate limiting: 10 requests per minute per IP
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per minute
    }]),
    // In-memory caching (can be upgraded to Redis in production)
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour cache TTL
      max: 100, // Maximum 100 items in cache
    }),
    AuthModule,
    DatabaseModule,
    ModerationModule,
    ContentModule,
    MonitoringModule,
  ],
})
export class AppModule {}
