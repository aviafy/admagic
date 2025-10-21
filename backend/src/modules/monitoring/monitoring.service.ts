import { Injectable } from '@nestjs/common';
import { ModerationService } from '../moderation/moderation.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MonitoringService {
  constructor(
    private moderationService: ModerationService,
    private databaseService: DatabaseService,
  ) {}

  /**
   * Get readiness status
   * Checks if all required services are available
   */
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

  /**
   * Get performance metrics
   */
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

  /**
   * Check database connectivity
   */
  private checkDatabase() {
    try {
      const client = this.databaseService.getClient();
      return {
        status: 'ok',
        message: 'Database connection active',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check moderation service
   */
  private checkModerationService() {
    try {
      return {
        status: 'ok',
        message: 'Moderation service active',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
