import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../util/modelWrapper';
import { Model, Types } from 'mongoose';
import { CustomerTierDbDto } from './dto/customer-tier-db.dto';
import { CustomerService } from '../customer/customer.service';
import { PublicCustomerDto } from '../customer/dto/public-customer.dto';
import { LoyaltyTierService } from '../loyalty-tier/loyalty-tier.service';
import { BusinessService } from '../business/business.service';
import { CustomerTierPublicDto } from './dto/customer-tier-public.dto';
import { BusinessDataDto } from '../business/dto/business-data.dto';
import { UserBusinessesDto } from './dto/user-businesses.dto';
import { WalletService } from '../wallet/wallet.service';
import { WalletTransactionsTypeEnum } from '../wallet-transactions/enum/wallet-transactions-type.enum';
import { getUserWalletStatus } from '../../util/globals';
import * as moment from 'moment';
import { CouponDbDto } from '../coupon/enum/coupon-db.dto';
import { CouponStatusEnum } from '../coupon/enum/coupon-status.enum';

/** lodash */
const _ = require('lodash');

@Injectable()
export class CustomerTierService {
  /**
   * PlaceService
   * @param placeModel
   * @param customerService
   * @param loyaltyTierService
   * @param businessService
   * @param walletService
   */
  constructor(
    @InjectModel('CustomerTier') private readonly placeModel: Model<CustomerTierDbDto>,
    private readonly customerService: CustomerService,
    private readonly loyaltyTierService: LoyaltyTierService,
    private readonly businessService: BusinessService,
    private readonly walletService: WalletService,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.placeModel);

  /**
   * join func - creates row in Place model
   * @returns {Promise<CustomerTierPublicDto>}
   * @param businessId
   * @param userId
   */
  async join(businessId: string, userId: string): Promise<CustomerTierPublicDto> {

    const business = await this.businessService.getBusinessData(businessId);

    if (_.isEmpty(business)) {
      throw new NotFoundException();
    }

    const { customer }: PublicCustomerDto = await this.customerService.details(userId);

    const firstLoyaltyTier = _.first(await this.loyaltyTierService.getTier(businessId, 1));

    const customerTierDb: CustomerTierDbDto = await this.model.findRow({
      query: {
        tierId: firstLoyaltyTier._id,
        customerId: customer._id,
      },
    });

    if (customerTierDb) {
      throw new ForbiddenException();
    }

    const customerTier: CustomerTierDbDto = await this.model.insertRow({
      data: {
        tierId: firstLoyaltyTier._id,
        customerId: customer._id,
        businessId,
      },
    });

    await this.walletService.create({ customerTierId: customerTier._id, businessId });

    return {
      customerTier,
      business,
    };
  }

  getByQuery(query): Promise<CustomerTierDbDto> {
    return this.model.findRow({ query });
  }

  async getAvailableBusinesses(userId: string): Promise<BusinessDataDto[]> {
    const { customer }: PublicCustomerDto = await this.customerService.details(userId);

    const customerTiers = await this.model.findRows({
      query: { customerId: Types.ObjectId(customer._id) },
    });

    const customerBusinessesId = _.map(customerTiers, 'businessId');

    return this.businessService.getBusinessesDataNoEqIds(customerBusinessesId);
  }

  async getUserBusinesses(userId: string): Promise<UserBusinessesDto[]> {
    const { customer }: PublicCustomerDto = await this.customerService.details(userId);
    const data = await this.model.aggregateRows({
      query: [
        {
          $match: { customerId: Types.ObjectId(customer._id) },
        },
        {
          $sort: { created_at: -1 },
        },
        {
          $lookup: {
            from: 'businesses',
            let: { businessId: '$businessId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$businessId'] } } },
              {
                $lookup: {
                  from: 'files',
                  localField: 'imageId',
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
            ],
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'loyaltytiers',
            localField: 'tierId',
            foreignField: '_id',
            as: 'loyaltyTier',
          },
        },
        { $unwind: '$loyaltyTier' },
        {
          $lookup: {
            from: 'wallets',
            localField: '_id',
            foreignField: 'customerTierId',
            as: 'wallet',
          },
        },
        { $unwind: '$wallet' },
        {
          $lookup: {
            from: 'wallettransactions',
            localField: 'wallet._id',
            foreignField: 'walletId',
            as: 'walletTransactions',
          },
        },
        {
          $lookup: {
            from: 'wallettransactions',
            let: { walletId: '$wallet._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_CONVERTED] },
                      { $eq: ['$walletId', '$$walletId'] },
                    ],
                  },
                },
              },
            ],
            as: 'walletTransactionsCoupons',
          },
        },
        {
          $lookup: {
            from: 'coupons',
            let: { walletTransactions: '$walletTransactionsCoupons' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$transactionId', '$$walletTransactions._id'] },
                      { $in: ['$status', [CouponStatusEnum.CREATED, CouponStatusEnum.REDEEMED]] },
                    ],
                  },
                },
              },
              {
                $count: 'count',
              },
            ],
            as: 'coupons',
          },
        },
        {
          $unwind: {
            path: '$coupons',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            '_id': 0,
            'business._id': 1,
            'business.brandName': 1,
            'business.imageId': 1,
            'business.image': 1,
            'loyaltyTier._id': 1,
            'loyaltyTier.tierName': 1,
            'loyaltyTier.tierLevel': 1,
            'walletTransactions.cost': 1,
            'walletTransactions.type': 1,
            'coupons': 1,
          },
        },
      ],
    });

    return _.map(data, ({ business, loyaltyTier, walletTransactions, coupons }) => {

      const { points } = getUserWalletStatus(walletTransactions);

      return {
        business,
        loyaltyTier,
        points,
        coupons: _.get(coupons, 'count', 0),
      };
    });
  }

  async getBusinessForUser(userId, businessId): Promise<any> {

    const { customer }: PublicCustomerDto = await this.customerService.details(userId);

    const business = await this.businessService.getBusinessData(businessId);

    const customerTier = _.first(await this.model.aggregateRows({
        query: [
          {
            $match: {
              $and: [
                { customerId: customer._id },
                { businessId: Types.ObjectId(businessId) },
              ],
            },
          },
          {
            $lookup: {
              from: 'loyaltytiers',
              localField: 'tierId',
              foreignField: '_id',
              as: 'userLoyaltyTier',
            },
          },
          { $unwind: '$userLoyaltyTier' },
          {
            $lookup: {
              from: 'loyaltyprograms',
              localField: 'userLoyaltyTier.loyaltyProgramId',
              foreignField: '_id',
              as: 'loyaltyProgram',
            },
          },
          { $unwind: '$loyaltyProgram' },
          {
            $match: {
              'loyaltyProgram.businessId': Types.ObjectId(businessId),
            },
          },
          {
            $lookup: {
              from: 'wallets',
              localField: '_id',
              foreignField: 'customerTierId',
              as: 'wallet',
            },
          },
          { $unwind: '$wallet' },
          {
            $lookup: {
              from: 'wallettransactions',
              let: { walletId: '$wallet._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$walletId', '$$walletId'] },
                        {
                          $or: [
                            { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_EARNED] },
                            { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_CONVERTED] },
                            { $eq: ['$type', WalletTransactionsTypeEnum.COUPON_DENIED] },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: 'walletTransactions',
            },
          },
          {
            $lookup: {
              from: 'wallettransactions',
              let: { walletId: '$wallet._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$walletId', '$$walletId'] },
                        {
                          $or: [
                            { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_EARNED] },
                          ],
                        },
                      ],
                    },
                  },
                },
              ],
              as: 'walletTransactionsTotal',
            },
          },
          {
            $project: {
              '_id': 0,
              'userLoyaltyTier': 1,
              'walletTransactions.cost': 1,
              'walletTransactionsTotal.cost': 1,
              'walletTransactions.type': 1,
              'walletTransactionsTotal.type': 1,
            },
          },
        ],
      }),
    );

    return {
      customerTier: _.omit(customerTier, ['walletTransactions', 'walletTransactionsTotal']),
      business,
      points: getUserWalletStatus(_.get(customerTier, 'walletTransactions')).points,
      maxPoints: getUserWalletStatus(_.get(customerTier, 'walletTransactionsTotal')).points,
    };
  }

  updateTier(customerTierId, tierId): Promise<CustomerTierPublicDto> {
    return this.model.updateRow({ query: { _id: customerTierId }, data: { tierId } });
  }

  async getWalletTransactions(customerId, businessId) {
    return _.first(await this.model.aggregateRows({
      query: [
        {
          $match: {
            $and: [
              { customerId },
              { businessId },
            ],
          },
        },
        {
          $lookup: {
            from: 'wallets',
            localField: '_id',
            foreignField: 'customerTierId',
            as: 'wallet',
          },
        },
        { $unwind: '$wallet' },
        {
          $lookup: {
            from: 'wallettransactions',
            localField: 'wallet._id',
            foreignField: 'walletId',
            as: 'walletTransactions',
          },
        },
        {
          $lookup: {
            from: 'wallettransactions',
            let: { walletId: '$wallet._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_CONVERTED] },
                      { $eq: ['$walletId', '$$walletId'] },
                      { $gte: ['$created_at', new Date(moment().startOf('day').toISOString())] },
                    ],
                  },
                },
              },
            ],
            as: 'walletTransactionsOfCurrentDay',
          },
        },
      ],
    }));
  }

  async getUserCoupons(customerId, businessId): Promise<CouponDbDto[]> {
    const data = _.first(
      await this.model.aggregateRows({
        query: [
          {
            $match: { customerId },
          },
          {
            $match: { businessId },
          },
          {
            $lookup: {
              from: 'wallets',
              localField: '_id',
              foreignField: 'customerTierId',
              as: 'wallet',
            },
          },
          { $unwind: '$wallet' },
          {
            $lookup: {
              from: 'wallettransactions',
              let: { walletId: '$wallet._id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_CONVERTED] },
                        { $eq: ['$walletId', '$$walletId'] },
                      ],
                    },
                  },
                },
              ],
              as: 'walletTransactions',
            },
          },
          {
            $lookup: {
              from: 'coupons',
              let: { walletTransactions: '$walletTransactions' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $in: ['$transactionId', '$$walletTransactions._id'] },
                        { $in: ['$status', [CouponStatusEnum.CREATED, CouponStatusEnum.REDEEMED]] },
                      ],
                    },
                  },
                },
              ],
              as: 'coupons',
            },
          },
          {
            $project: {
              _id: 0,
              coupons: 1,
            },
          },
        ],
      }),
    );

    return _.get(data, 'coupons', []);
  }

  async getByWalletId(walletId): Promise<CustomerTierDbDto> {
    return _.first(await this.model.aggregateRows({
      query: [
        {
          $lookup: {
            from: 'wallets',
            localField: '_id',
            foreignField: 'customerTierId',
            as: 'wallet',
          },
        },
        { $unwind: '$wallet' },
        { $match: { 'wallet._id': Types.ObjectId(walletId) } },
      ],
    }));
  }
}
