import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

/**
 * HealthcheckController
 * resposible for healthcheck
 */
@ApiTags('health')
@Controller()
export class HealthcheckController {
  /**
   * /health endpoint handler
   * @returns {string}
   */
  @Get('health')
  @ApiResponse({ status: 200, description: 'OK', type: String })
  getHealth(): string {
    return 'healthy';
  }
}
