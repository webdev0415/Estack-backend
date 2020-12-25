import * as _ from 'lodash';
import { Body, Controller, Get, Logger, Param, Post, Put, Req, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { InvitedPosesResponseDto } from './dto/invited-poses-response.dto';
import { InvitePosesDto } from './dto/invite-poses.dto';
import { CreatePosDto } from './dto/create-pos.dto';
import { MongoIdDto } from '../../util/dto/mongo-id.dto';
import { PublicPosDto } from './dto/public-pos.dto';
import { JwtPayload } from '../auth/dto/jwt-payload.dto';
import { GrandPointsDto } from './dto/grand-points.dto';
import { genOpenTheAppPage } from '../../util/htmlPages/getOpenTheAppPage';
import { UpdatePosResponseDto } from './dto/update-pos-response.dto';
import { PublicUserDto } from '../users/dto/public-user.dto';
import { CreatePlaceDto } from '../place/dto/create-place.dto';
import { CouponDbDto } from '../coupon/enum/coupon-db.dto';
import { PosValidationService } from './pos-validation.service';
import { PosStatusEnum, PosStatusMethodEnum } from '../merchant/enum/pos-status.enum';
import { PosDbDto } from './dto/pos-db.dto';
import { getExpiredDeepLinkPage } from '../../util/htmlPages/getExpiredDeepLinkPage';
import { GrandPointsDataDto } from './dto/grand-points-data.dto';

/**
 * pos controller
 */
@ApiTags('pos')
@Controller('pos')
export class PosController {
  /** logger */
  private readonly logger = new Logger(PosController.name);

  /**
   * @param {PosService} posService - inject
   * @param validationService
   */
  constructor(
    private readonly posService: PosService,
    private readonly validationService: PosValidationService,
  ) {
  }

  @Post('/service/invite')
  @ApiOperation({ operationId: 'invitePoses' })
  @ApiResponse({ status: 201, description: 'OK', type: InvitedPosesResponseDto })
  invite(@Req() { user }, @Body() poses: InvitePosesDto): Promise<InvitedPosesResponseDto> {
    this.logger.log(`invite`);
    return this.posService.invite(poses, user);
  }

  @Post('/create')
  @ApiOperation({ operationId: 'create' })
  @ApiResponse({ status: 201, description: 'OK', type: InvitedPosesResponseDto })
  create(@Body() data: CreatePosDto): Promise<PublicPosDto> {
    this.logger.log(`create`);
    return this.posService.createPos(data);
  }

  @Post('/service/grant-points/:id')
  @ApiOperation({ operationId: 'grantPoints' })
  @ApiResponse({ status: 200, description: 'OK', type: 'number' })
  async grantPoints(
    @Request() { user}: { user: JwtPayload },
    @Param() params: MongoIdDto,
    @Body() { currencyAmount }: GrandPointsDto): Promise<number> {
    await this.validationService.baseValidation(user);
    return this.posService.grantPoints(user._id, params.id, currencyAmount);
  }

  @Get('service/transactions/logs-list')
  @ApiOperation({ operationId: 'getCustomerTransactionsLogsList' })
  @ApiResponse({ status: 201, description: 'OK' })
  async getPosTransactionsLogsList(@Request() { user }): Promise<{points: number, coupons: number, gmv: number}> {
    const { pos } = await this.validationService.baseValidation(user);
    return this.posService.getWalletTransactionsLogs(pos._id);
  }

  @Get('deep-link/:link')
  async sendDeepLink(@Param('link') rawLink: string) {
    const link = _.replace(rawLink, /@@/g, '/');
    const canDeepLinkBeOpen = await this.validationService.canDeepLinkBeOpen(link);
    if (!canDeepLinkBeOpen) {
      return getExpiredDeepLinkPage();
    }
    return genOpenTheAppPage(link);
  }

  @Put('service/self')
  @ApiOperation({ operationId: 'updatePos' })
  @ApiResponse({ status: 201, description: 'OK', type: UpdatePosResponseDto })
  async updateSelf(
    @Request() { user }: { user: JwtPayload },
    @Body('place') place: Partial<CreatePlaceDto>,
  ): Promise<UpdatePosResponseDto> {
    const { pos } = await this.validationService.baseValidation(user);
    return this.posService.updateSelf(pos, place);
  }

  @Get('service/self')
  @ApiOperation({ operationId: 'updatePos' })
  @ApiResponse({ status: 201, description: 'OK', type: UpdatePosResponseDto })
  async getSelf(
    @Request() { user }: { user: PublicUserDto },
  ): Promise<PublicPosDto> {
    await this.validationService.baseValidation(user);
    return this.posService.getSelf(user);
  }

  @Put('service/accept-coupon/:couponUuid')
  @ApiOperation({ operationId: 'updatePos' })
  @ApiResponse({ status: 201, description: 'OK', type: UpdatePosResponseDto })
  async acceptCoupon(
    @Request() { user }: { user: PublicUserDto },
    @Param('couponUuid') couponUuid: string,
  ): Promise<CouponDbDto> {
    const { pos } = await this.validationService.baseValidation(user);
    const { coupon } = await this.validationService.canCouponBePressed(pos, couponUuid);
    return this.posService.acceptCoupon(pos, coupon);
  }

  @Put('service/deny-coupon/:couponUuid')
  @ApiOperation({ operationId: 'updatePos' })
  @ApiResponse({ status: 201, description: 'OK', type: UpdatePosResponseDto })
  async denyCoupon(
    @Request() { user }: { user: PublicUserDto },
    @Param('couponUuid') couponUuid: string,
  ): Promise<CouponDbDto> {
    const { pos } = await this.validationService.baseValidation(user);
    const { coupon } = await this.validationService.canCouponBePressed(pos, couponUuid);
    return this.posService.denyCoupon(pos, coupon);
  }

  @Put('service/revoke-pos/:id')
  @ApiOperation({ operationId: 'revokePos' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicUserDto })
  async revokePos(
    @Request() { user }: { user: PublicUserDto },
    @Param() { id: posId }: MongoIdDto,
  ): Promise<PosDbDto> {
    await this.validationService.canPosStatusBeChanged(
      user,
      posId,
      { method: PosStatusMethodEnum.REVOKE, newStatus: PosStatusEnum.REVOKED },
      );
    return this.posService.changePosStatus(posId, PosStatusEnum.REVOKED);
  }

  @Put('service/activate-pos/:id')
  @ApiOperation({ operationId: 'activatePos' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicUserDto })
  async activatePos(
    @Request() { user }: { user: PublicUserDto },
    @Param() { id: posId }: MongoIdDto,
  ): Promise<PosDbDto> {
    await this.validationService.canPosStatusBeChanged(
      user,
      posId,
      { method: PosStatusMethodEnum.ACTIVATE, newStatus: PosStatusEnum.ACTIVE },
    );
    return this.posService.changePosStatus(posId, PosStatusEnum.ACTIVE);
  }

  @Put('service/delete-pos/:id')
  @ApiOperation({ operationId: 'deletePos' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicUserDto })
  async deletePos(
    @Request() { user }: { user: PublicUserDto },
    @Param() { id: posId }: MongoIdDto,
  ): Promise<PosDbDto> {
    await this.validationService.canPosStatusBeChanged(
      user,
      posId,
      { method: PosStatusMethodEnum.DELETE, newStatus: PosStatusEnum.DELETED },
    );
    return this.posService.changePosStatus(posId, PosStatusEnum.DELETED);
  }

  @Put('service/re-invite/:id')
  @ApiOperation({ operationId: 'reInvite' })
  @ApiResponse({ status: 200, description: 'OK',  type: PublicUserDto })
  async reInvite(
    @Request() { user }: { user: PublicUserDto },
    @Param() { id: posId }: MongoIdDto,
  ): Promise<PosDbDto> {
    const { pos, business } = await this.validationService.canPosStatusBeChanged(
      user,
      posId,
      { method: PosStatusMethodEnum.RE_INVITE, newStatus: PosStatusEnum.PENDING },
    );
    await this.posService.resendInvite(pos, business);
    return this.posService.changePosStatus(posId, PosStatusEnum.PENDING);
  }

  @Post('service/resend-invite/:id')
  @ApiOperation({ operationId: 'resendInvite' })
  @ApiResponse({ status: 200, description: 'OK' })
  async resendInvite(
    @Request() { user }: { user: PublicUserDto },
    @Param() { id: posId }: MongoIdDto,
  ): Promise<boolean | void> {
    const { pos, business } = await this.validationService.canPosStatusBeChanged(
      user,
      posId,
      { method: PosStatusMethodEnum.RESEND_INVITE, newStatus: PosStatusEnum.PENDING },
    );
    return this.posService.resendInvite(pos, business);
  }

  @Put('service/cancel-invitations/:id')
  @ApiOperation({ operationId: 'cancelPosInvitations' })
  @ApiResponse({ status: 201, description: 'OK', type: PublicUserDto })
  async cancelPosInvitations(
    @Request() { user }: { user: PublicUserDto },
    @Param() { id: posId }: MongoIdDto,
  ): Promise<PosDbDto> {
    await this.validationService.canPosStatusBeChanged(
      user,
      posId,
      { method: PosStatusMethodEnum.CANCEL, newStatus: PosStatusEnum.INVITE_CANCELLED },
    );
    await this.posService.cancelPosInvitations(posId);
    return this.posService.changePosStatus(posId, PosStatusEnum.INVITE_CANCELLED);
  }

  @Get('service/get-customer-info/:id')
  @ApiOperation({ operationId: 'getCustomerInfo' })
  @ApiResponse({ status: 201, description: 'OK', type: GrandPointsDataDto })
  async getCustomerInfo(
    @Request() { user }: { user: PublicUserDto },
    @Param() { id: customerId }: MongoIdDto,
  ): Promise<GrandPointsDataDto> {
    const { pos } = await this.validationService.baseValidation(user);
    return this.posService.getCustomerTier(customerId, pos);
  }
}
