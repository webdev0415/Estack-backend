import { Controller, Get, Logger, Req, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtPayload } from '../auth/dto/jwt-payload.dto';
import { WalletTransactionsLogsService } from './wallet-transactions-logs.service';
import { GetDashboardDto } from './dto/getDashboardInfo.dto';
import { GetPointEarnedTableDto } from './dto/publicGetDashboardInfo.dto';

@Controller('WalletTransactionsLogs')
export class WalletTransactionsLogsController {
  /** logger instance */
  logger = new Logger(WalletTransactionsLogsController.name);
  /**
   * @param walletTransactionsLogsService
   */
  constructor(
    private readonly walletTransactionsLogsService: WalletTransactionsLogsService,
  ) {
  }

  /**
   * /getDashboardInfo endpoint handler
   * @param id
   * @returns {Promise<PublicCustomerDto>} - updated customer
   * @param businessId
   * @param cost
   */
  @Get('service/getDashboardInfo/merchant')
  @ApiOperation({ operationId: 'getDashboardInfo' })
  @ApiResponse({ status: 201, description: 'OK', type: '' }) // todo
  async getDashboardInfo(
    @Req() { user }: { user: JwtPayload },
  ): Promise<GetDashboardDto> {
    return this.walletTransactionsLogsService.getDashboardInfo(user);
  }

  /**
   * /update endpoint handler
   * @returns {Promise<PublicCustomerDto>} - getDashboardInfoPointEarnedTable
   */
  @Get('service/getDashboardInfoPointEarnedTable/merchant')
  @ApiOperation({ operationId: 'getDashboardInfo' })
  @ApiResponse({ status: 201, description: 'OK', type: '' }) // todo
  async getDashboardInfoPointEarnedTable(
    @Req() { user }: { user: JwtPayload },
    @Query() data: GetPointEarnedTableDto,
  ): Promise<GetDashboardDto> {
    return this.walletTransactionsLogsService.getDashboardInfoPointEarnedTable(data, user);
  }
}
