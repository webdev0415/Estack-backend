import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CouponDbDto } from './enum/coupon-db.dto';
import { CountersService } from '../counters/counters.service';
import { DbModel } from '../../util/modelWrapper';
import { WalletTransactionsService } from '../wallet-transactions/wallet-transactions.service';
import { CurrencyEnum } from '../../util/globals/enums/currency.enum';
import { WalletTransactionsTypeEnum } from '../wallet-transactions/enum/wallet-transactions-type.enum';
import { BusinessDataDto } from '../business/dto/business-data.dto';
import { formula } from '../../util/globals';
import { CustomerTierService } from '../customer-tier/customer-tier.service';
import { CouponStatusEnum } from './enum/coupon-status.enum';
import { Gateway } from '../../util/gateway/gateway';
import { EventNamesEnum } from '../../util/gateway/enum/event-names.enum';
import { CustomerService } from '../customer/customer.service';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel('Coupon') private readonly couponModel: Model<CouponDbDto>,
    private readonly seq: CountersService,
    private readonly customerTierService: CustomerTierService,
    private readonly walletTransactionsService: WalletTransactionsService,
    private readonly customerService: CustomerService,
    private readonly gateway: Gateway,
  ) {
  }

  private readonly model = new DbModel(this.couponModel);

  async create(customer, business: BusinessDataDto, wallet, cost) {
    const { brandName, _id: businessId, pointCurrency: { calcFactor } } = business;

    const { _id: transactionId } = await this.walletTransactionsService.create({
      customerId: customer._id,
      type: WalletTransactionsTypeEnum.POINTS_CONVERTED,
      currency: CurrencyEnum.POINTS,
      walletId: wallet._id,
      cost,
      businessId,
      text: `Converted points to coupon at ${brandName}`,
    });

    await this.walletTransactionsService.create({
      customerId: customer._id,
      type: WalletTransactionsTypeEnum.COUPON_CREATED,
      currency: CurrencyEnum.DOLLARS,
      walletId: wallet._id,
      cost: formula.createCoupon(cost, calcFactor),
      text: `Created Coupon from points earned at ${brandName}`,
    });

    return this.model.insertRow({
      data: {
        cost: formula.createCoupon(cost, calcFactor),
        uuid: await this.seq.getNextVal('coupon'),
        businessId,
        transactionId,
      },
    });
  }

  getCouponsList(customer, business: BusinessDataDto): Promise<CouponDbDto[]> {
    return this.customerTierService.getUserCoupons(customer._id, business._id);
  }

  async redeemCoupon(customer, place, couponUuid): Promise<CouponDbDto> {
    const coupon = await this.model.updateRow({
      query: {
        $and: [
          { uuid: couponUuid },
        ],
      },
      data: {
        placeId: place._id,
        status: CouponStatusEnum.REDEEMED,
      },
    });

    this.gateway.emitEvent(EventNamesEnum.COUPON_REDEEMED, {
      coupon,
      ...await this.customerService.getCustomerDetails(customer._id),
    });
    return coupon;
  }

  async acceptCoupon(coupon, pos, business): Promise<CouponDbDto> {

    const { walletId } = await this.walletTransactionsService.getByQuery({ _id: Types.ObjectId(coupon.transactionId) });
    const customerTier = await this.customerTierService.getByWalletId(walletId);

    await this.walletTransactionsService.create({
      walletId,
      currency: business.currency,
      businessId: business._id,
      text: `Redeemed ${coupon.type || 'limited value'} coupon at ${business.brandName}`,
      customerId: customerTier.customerId,
      posId: pos._id,
      type: WalletTransactionsTypeEnum.COUPON_ACCEPTED,
      cost: coupon.cost,
      currencyAmount: (coupon.cost * coupon.cost) / coupon.cost, // escape from < 0 numbers
    });

    const acceptedCoupon = await this.model.updateRow({
      query: {
        $and: [
          { uuid: coupon.uuid },
        ],
      },
      data: {
        status: CouponStatusEnum.ACCEPTED,
      },
    });

    this.gateway.emitEvent(EventNamesEnum.COUPON_ACCEPTED, acceptedCoupon);
    return acceptedCoupon;
  }

  async denyCoupon(coupon, pos, business): Promise<CouponDbDto> {
    const { walletId, cost } = await this.walletTransactionsService.getByQuery({ _id: Types.ObjectId(coupon.transactionId) });

    const customerTier = await this.customerTierService.getByWalletId(walletId);

    await this.walletTransactionsService.create({
      walletId,
      currency: business.currency,
      text: `Redeemed ${coupon.type || 'limited value'} coupon at ${business.brandName}`,
      customerId: customerTier.customerId,
      posId: pos._id,
      type: WalletTransactionsTypeEnum.COUPON_ACCEPTED,
      cost: coupon.cost,
    });

    await this.walletTransactionsService.create({
      walletId,
      currency: CurrencyEnum.POINTS,
      text: `Refunded ${coupon.type || 'limited value'} coupon at ${business.brandName}`,
      customerId: customerTier.customerId,
      posId: pos._id,
      type: WalletTransactionsTypeEnum.COUPON_DENIED,
      cost,
    });

    const deniedCoupon = await this.model.updateRow({
      query: {
        $and: [
          { uuid: coupon.uuid },
        ],
      },
      data: {
        status: CouponStatusEnum.DENIED,
      },
    });

    this.gateway.emitEvent(EventNamesEnum.COUPON_DENIED, deniedCoupon);
    return deniedCoupon;
  }

  getCouponsByPlaceId(placeId): Promise<CouponDbDto[]> {
    return this.model.aggregateRows({
      query: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$placeId', Types.ObjectId(placeId)] },
                { $eq: ['$status', CouponStatusEnum.REDEEMED] },
              ],
            },
          },
        },
        {
          $sort: { created_at: -1 },
        },
        {
          $lookup: {
            from: 'wallettransactionslogs',
            localField: 'transactionId',
            foreignField: 'transactionId',
            as: 'walletTransactionsLog',
          },
        },
        { $unwind: '$walletTransactionsLog' },
        {
          $lookup: {
            from: 'customers',
            localField: 'walletTransactionsLog.customerId',
            foreignField: '_id',
            as: 'customer',
          },
        },
        { $unwind: '$customer' },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$customer.userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $lookup: {
                  from: 'files',
                  localField: 'avatarFileId',
                  foreignField: '_id',
                  as: 'image',
                },
              },
              {
                $unwind: {
                  path: '$image',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  avatarFileId: 1,
                  auth: 1,
                  fullName: 1,
                  image: 1,
                },
              },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            walletTransactionsLog: 0,
          },
        },
      ],
    });
  }

  getByQuery(query): Promise<CouponDbDto> {
    return this.model.findRow({ query });
  }
}
