import { Body, Controller, Get, Logger, Param, Post, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MongoIdDto } from '../../util/dto/mongo-id.dto';
import { CouponService } from './coupon.service';
import { JwtPayload } from '../auth/dto/jwt-payload.dto';
import { CouponValidationService } from './coupon-validation.service';
import { CreateCouponDto } from './enum/create-coupon.dto';
import { CouponDbDto } from './enum/coupon-db.dto';
import { RedeemCouponDto } from './dto/redeem-coupon.dto';

@Controller('coupon')
export class CouponController {
  /** logger instance */
  logger = new Logger(CouponController.name);
  /**
   * @param couponService
   * @param couponValidationService
   */
  constructor(
    private readonly couponService: CouponService,
    private readonly couponValidationService: CouponValidationService,
  ) {
  }

  /**
   * /update endpoint handler
   * @param id
   * @returns {Promise<PublicCustomerDto>} - updated customer
   * @param businessId
   * @param cost
   */
  @Post('service/create/:id')
  @ApiOperation({ operationId: 'createCoupon' })
  @ApiResponse({ status: 201, description: 'OK', type: '' }) // todo
  async createCoupon(
    @Req() { user }: { user: JwtPayload },
    @Param() { id: businessId }: MongoIdDto,
    @Body() { cost }: CreateCouponDto,
  ): Promise<CouponDbDto> {
    const { customer, business } = await this.couponValidationService.baseValidation(user._id, businessId);
    const { wallet } = await this.couponValidationService.canCouponBeCreated(customer, business, cost);

    return this.couponService.create(customer, business, wallet, cost);
  }

  @Get('service/coupons-list/:id')
  @ApiOperation({ operationId: 'createCoupon' })
  @ApiResponse({ status: 201, description: 'OK', type: 'CouponDbDto[]' })
  async getCouponsList(
    @Req() { user }: { user: JwtPayload },
    @Param() { id: businessId }: MongoIdDto): Promise<CouponDbDto[]> {
    const { customer, business } = await this.couponValidationService.baseValidation(user._id, businessId);
    return this.couponService.getCouponsList(customer, business);
  }

  @Put('service/redeem/:id')
  @ApiOperation({ operationId: 'redeemCoupon' })
  @ApiResponse({ status: 201, description: 'OK', type: 'CouponDbDto[]' })
  async redeemCoupon(
    @Req() { user }: { user: JwtPayload },
    @Param('id') couponUuid: string,
    @Body() { lat, lng }: RedeemCouponDto,
  ): Promise<CouponDbDto> {
    const { customer, place } = await this.couponValidationService.canCouponBeRedeemed(user._id, couponUuid, { lat, lng });
    return this.couponService.redeemCoupon(customer, place, couponUuid);
  }
}
