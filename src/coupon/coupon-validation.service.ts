import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CustomerService } from '../customer/customer.service';
import { BusinessService } from '../business/business.service';
import { getUserWalletStatus } from '../../util/globals';
import { CustomerTierService } from '../customer-tier/customer-tier.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CouponDbDto } from './enum/coupon-db.dto';
import { DbModel } from '../../util/modelWrapper';
import { CouponStatusEnum } from './enum/coupon-status.enum';
import { PlaceService } from '../place/place.service';

@Injectable()
export class CouponValidationService {
  constructor(
    @InjectModel('Coupon') private readonly couponModel: Model<CouponDbDto>,
    private readonly customerService: CustomerService,
    private readonly placeService: PlaceService,
    private readonly businessService: BusinessService,
    private readonly customerTierService: CustomerTierService,
  ) {
  }

  private readonly model = new DbModel(this.couponModel);

  async canCouponBeCreated(customer, business, cost) {
    const { walletTransactionsOfCurrentDay, walletTransactions, wallet } =
      await this.customerTierService.getWalletTransactions(customer._id, business._id);

    const { pointCurrency: { maxPurchase, maxPurchaseDay } } = business;

    if (cost > maxPurchase) {
      throw new BadRequestException({
        type: 'TRANSACTION_LIMIT',
        pointsAmount: cost,
        maxAmount: maxPurchase,
      });
    }

    const { points: totalUserPoints } = getUserWalletStatus(walletTransactions);

    if (cost > totalUserPoints) {
      throw new BadRequestException({
        type: 'WALLET_LIMIT',
        pointsAmount: cost,
        maxAmount: totalUserPoints,
      });
    }

    const { points: pointsSpentToday } = getUserWalletStatus(walletTransactionsOfCurrentDay);

    if (pointsSpentToday > maxPurchaseDay) {
      throw new BadRequestException({
        type: 'DAY_LIMIT',
        pointsAmount: cost,
        maxAmount: maxPurchaseDay - pointsSpentToday,
      });
    }

    return { wallet };
  }

  async baseValidation(userId, businessId): Promise<any> {
    const customer = await this.customerService.getByUserId(userId);

    if (!customer) {
      throw new ForbiddenException();
    }

    const business = await this.businessService.getBusinessData(businessId);

    if (!business || business.loyaltyProgram.isActive === false) {
      throw new NotFoundException('business not found');
    }

    const customerTier = await this.customerTierService.getByQuery({ customerId: customer._id, businessId: business._id });

    if (!customerTier) {
      throw new ForbiddenException('user doesnt join the shop');
    }

    return {
      customer,
      business,
      customerTier,
    };
  }

  async canCouponBeRedeemed(userId, couponUuid, { lat, lng }) {
    const customer = await this.customerService.getByUserId(userId);

    if (!customer) {
      throw new ForbiddenException();
    }

    const coupon: CouponDbDto = await this.model.findRow({ query: { uuid: couponUuid } });

    if (!coupon) {
      throw new NotFoundException('coupon not found');
    }

    const business = await this.businessService.getBusinessData(coupon.businessId);

    if (!business || business.loyaltyProgram.isActive === false) {
      throw new NotFoundException('business not found');
    }

    if (coupon.status !== CouponStatusEnum.CREATED) {
      throw new NotFoundException('coupon not found');
    }

    const nearestPlace = await this.placeService.findNear(coupon.businessId, [lng, lat]);
    if (!nearestPlace) {
      throw new BadRequestException('to far to do this');
    }

    return {
      customer,
      place: nearestPlace,
    };
  }
}
