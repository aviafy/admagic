import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { ModerationModule } from '../moderation/moderation.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ModerationModule, DatabaseModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}
