import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * Health check endpoint
   * Returns 200 if service is healthy
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  /**
   * Readiness check endpoint
   * Returns 200 if service is ready to accept traffic
   */
  @Get('readiness')
  @HttpCode(HttpStatus.OK)
  readiness() {
    return this.monitoringService.getReadinessStatus();
  }

  /**
   * Performance metrics endpoint
   * Returns cache hit rates, cost savings, and request statistics
   */
  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  metrics() {
    return this.monitoringService.getMetrics();
  }
}
