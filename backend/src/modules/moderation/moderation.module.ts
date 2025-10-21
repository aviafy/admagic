import { Module } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { ModerationCacheService } from './cache/moderation-cache.service';

@Module({
  providers: [ModerationService, ModerationCacheService],
  exports: [ModerationService],
})
export class ModerationModule {}
