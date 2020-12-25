import * as _ from 'lodash';
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { MerchantDbDto } from './dto/merchant-db.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DbModel } from '../../util/modelWrapper';
import { SubscriptionService } from '../subscription/subscription.service';
import { SubscriptionDbDto } from '../subscription/dto/subscription-db.dto';
import { RolesEnum } from '../users/enums/roles.enum';
import { BusinessService } from '../business/business.service';
import { BusinessDbDto } from '../business/dto/business-db.dto';
import { PublicMerchantDto } from './dto/public-merchant.dto';
import { AuthService } from '../auth/auth.service';
import { LoyaltyProgramDbDto } from '../loyalty-program/dto/loyalty-program-db.dto';
import { LoyaltyProgramService } from '../loyalty-program/loyalty-program.service';
import { LoyaltyTierService } from '../loyalty-tier/loyalty-tier.service';
import { LoyaltyTierDbDto } from '../loyalty-tier/dto/loyalty-tier-db.dto';
import { DbUserDto } from '../users/dto/db-user.dto';
import { PointCurrencyService } from '../point-currency/point-currency.service';
import { PointCurrencyDbDto } from '../point-currency/dto/point-currency-db.dto';
import { PosStatusEnum } from './enum/pos-status.enum';
import { WalletTransactionsTypeEnum } from '../wallet-transactions/enum/wallet-transactions-type.enum';
import { PublicUserDto } from '../users/dto/public-user.dto';
import { CreateMerchantSocialDto } from './dto/create-merchant-social.dto';
import { getRandom4Numbers, sendEmail } from '../../util/globals';
import { getResetPasswordPage } from '../../util/htmlPages/getResetPasswordPage';
import { CardInterface, CardList, DeleteCardInterface, StripeService, TransactionInterface } from '../../util/spripe/stripe';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { CreateFileDto } from '../filel/dto/create-file.dto';
import { FilesRepository } from '../filel/files.repository';
import { BusinessDto } from '../business/dto/business.dto';

@Injectable()
export class MerchantService {

  /**
   * MerchantService
   * @param merchantModel
   * @param {UsersService} usersService - inject
   * @param authService
   * @param subscriptionService
   * @param {BusinessService} businessService - inject
   * @param loyaltyProgramService
   * @param loyaltyTierService
   * @param pointCurrency
   * @param stripeService
   * @param fileRepository
   */
  constructor(
    @InjectModel('Merchant') private readonly merchantModel: Model<MerchantDbDto>,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly subscriptionService: SubscriptionService,
    private readonly businessService: BusinessService,
    private readonly loyaltyProgramService: LoyaltyProgramService,
    private readonly loyaltyTierService: LoyaltyTierService,
    private readonly pointCurrency: PointCurrencyService,
    private readonly stripeService: StripeService,
    private readonly fileRepository: FilesRepository,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.merchantModel);

  /**
   * create func
   * @param {CreateMerchantDto} user - merchant data
   * @returns {Promise<PublicMerchantDto>} - created merchant
   */
  async create(user: CreateMerchantDto): Promise<PublicMerchantDto> {
    const {
      brandName,
      password,
      email,
      quantityOfPos,
      paymentCycle,
    } = user;

    if (await this.usersService.exist({ 'auth.email': email })) {
      throw new HttpException('email exists', HttpStatus.BAD_REQUEST);
    }

    if (await this.businessService.exist({ brandName })) {
      throw new HttpException('brand name exists', HttpStatus.BAD_REQUEST);
    }

    const localUser: DbUserDto = await this.usersService.create({
      email,
      password,
      roles: [RolesEnum.MERCHANT],
    });

    const {
      business, subscription, merchant, loyaltyProgram, loyaltyTiers, pointCurrency,
    } = await this.createMerchant(localUser, brandName, quantityOfPos, paymentCycle);

    const { places, poses } = await this.getPoses(merchant._id);

    return {
      user: localUser,
      merchant,
      business,
      subscription,
      loyaltyProgram,
      loyaltyTiers,
      pointCurrency,
      places,
      poses,
      ...await this.authService.genTokens({
        ...localUser,
        subscription,
      }),
    };
  }

  async createMerchant(localUser, brandName, quantityOfPos, paymentCycle) {
    const stripeUser = await this.stripeService.create({ name: brandName, email: localUser.email });
    const merchant: MerchantDbDto = await this.model.insertRow({
      data: {
        userId: _.get(localUser, '_id'),
        stripeId: stripeUser.id,
      },
    });

    const business: BusinessDbDto = await this.businessService.create({
      merchantId: _.get(merchant, '_id'),
      brandName,
    });

    const subscription: SubscriptionDbDto = await this.subscriptionService.create({
      merchantId: _.get(merchant, '_id'),
      quantityOfPos,
      paymentCycle,
    });

    const loyaltyProgram: LoyaltyProgramDbDto = await this.loyaltyProgramService.create({
      businessId: business._id,
    });

    const loyaltyTiers: LoyaltyTierDbDto[] = [
      await this.loyaltyTierService.create({
        loyaltyProgramId: loyaltyProgram._id,
        multiplier: 1,
        pointThreshold: 0,
        spendThreshold: 0,
        isActive: true,
        tierLevel: 1,
        tierName: 'Gold',
      }),
      await this.loyaltyTierService.create({
        loyaltyProgramId: loyaltyProgram._id,
        multiplier: 1.2,
        pointThreshold: 1000,
        spendThreshold: 1000,
        isActive: false,
        tierLevel: 2,
        tierName: 'Platinum',
      }),
      await this.loyaltyTierService.create({
        loyaltyProgramId: loyaltyProgram._id,
        multiplier: 1.5,
        pointThreshold: 2440,
        spendThreshold: 2200,
        isActive: false,
        tierLevel: 3,
        tierName: 'Club',
      }),
    ];

    const pointCurrency: PointCurrencyDbDto = await this.pointCurrency.create(business._id);

    return {
      merchant,
      business,
      subscription,
      loyaltyProgram,
      loyaltyTiers,
      pointCurrency,
    };
  }

  async googleSingUp(token: string, { brandName, quantityOfPos, paymentCycle }: CreateMerchantSocialDto) {
    const data = await this.authService.getGoogleCreeds(token);

    const password = getRandom4Numbers();

    const localUser: DbUserDto = await this.usersService.create({
      email: data.email,
      googleId: data.user_id,
      password,
      roles: [RolesEnum.MERCHANT],
    });

    const {
      business, subscription, merchant, loyaltyProgram, loyaltyTiers, pointCurrency,
    } = await this.createMerchant(localUser, brandName, quantityOfPos, paymentCycle);

    const { places, poses } = await this.getPoses(merchant._id);

    sendEmail(data.email, 'Registration', getResetPasswordPage(password));

    return {
      user: localUser,
      merchant,
      business,
      subscription,
      loyaltyProgram,
      loyaltyTiers,
      pointCurrency,
      places,
      poses,
      ...await this.authService.genTokens({
        ...localUser,
        subscription,
      }),
    };
  }

  async getAllData(userId) {
    const data = _.first(await this.model.aggregateRows({
      query: [
        { $match: { userId: Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'businesses',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'subscription',
          },
        },
        { $unwind: '$subscription' },
        {
          $lookup: {
            from: 'loyaltyprograms',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'loyaltyProgram',
          },
        },
        { $unwind: '$loyaltyProgram' },
        {
          $lookup: {
            from: 'loyaltytiers',
            let: { loyaltyProgramId: '$loyaltyProgram._id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$loyaltyProgramId', '$$loyaltyProgramId'] } } },
              { $sort: { tierLevel: 1 } },
            ],
            as: 'loyaltyTiers',
          },
        },
        {
          $lookup: {
            from: 'pointcurrencies',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'pointCurrency',
          },
        },
        { $unwind: '$pointCurrency' },
      ],
    }));

    if (_.isEmpty(data)) {
      throw new UnauthorizedException();
    }

    const { business }: { business: BusinessDbDto } = data;
    const image = business.imageId ? await this.fileRepository.getById(business.imageId) : null;
    return {
      ...data,
      business: {
        ...business,
        image,
      },
    };
  }

  async getByUserId(userId): Promise<MerchantDbDto> {
    const merchant = await this.model.findRow({ query: { userId: Types.ObjectId(userId) } });

    if (_.isNil(merchant)) {
      throw new ForbiddenException();
    }

    return merchant;
  }

  async canLoyaltyProgramStatusBeChanged(userId): Promise<void> {
    const data = _.first(await this.model.aggregateRows({
      query: [
        { $match: { userId: Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'businesses',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'subscription',
          },
        },
        { $unwind: '$subscription' },
        {
          $lookup: {
            from: 'loyaltyprograms',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'loyaltyProgram',
          },
        },
        { $unwind: '$loyaltyProgram' },
      ],
    }));

    if (!data) {
      throw new ForbiddenException();
    }

    if (data.subscription.isActive === false && data.loyaltyProgram.isActive === false) {
      throw new ForbiddenException('You can\'t activate Loyalty Program if subscription is\'t active!');
    }
  }

  async getPoses(merchantId) {
    return _.first(await this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(merchantId) } },
        {
          $lookup: {
            from: 'businesses',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'places',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'places',
          },
        },
        {
          $lookup: {
            from: 'pos',
            let: { places: '$places' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$placeId', '$$places._id'] },
                      { $ne: ['$status', PosStatusEnum.DELETED] },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'user',
                },
              },
              { $unwind: '$user' },
              {
                $lookup: {
                  from: 'places',
                  localField: 'placeId',
                  foreignField: '_id',
                  as: 'place',
                },
              },
              { $unwind: '$place' },
            ],
            as: 'poses',
          },
        },
        {
          $project: {
            _id: 0,
            places: 1,
            poses: 1,
          },
        },
      ],
    }));
  }

  async getPosesFormattedData(merchantId, onlyActiveStatus = false) {
    const data = await this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(merchantId) } },
        {
          $lookup: {
            from: 'businesses',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'places',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'places',
          },
        },
        {
          $lookup: {
            from: 'pos',
            let: { places: '$places', status: '$status' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$placeId', '$$places._id'] },
                      { $ne: ['$status', PosStatusEnum.DELETED] },
                      onlyActiveStatus ? { $in: ['$status', [PosStatusEnum.ACTIVE]] } : {},
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'user',
                },
              },
              { $unwind: '$user' },
              {
                $lookup: {
                  from: 'places',
                  localField: 'placeId',
                  foreignField: '_id',
                  as: 'place',
                },
              },
              { $unwind: '$place' },
              { $sort: { id: 1 } },
            ],
            as: 'poses',
          },
        },
        {
          $project: {
            _id: 0,
            poses: 1,
          },
        },
      ],
    });
    return _.chain(data).first().get('poses').map((pos) => ({
      ...pos,
      user: this.usersService.returnPublicUser(pos.user),
    })).value();
  }

  async self(user): Promise<PublicMerchantDto> {
    const merchant = await this.getByUserId(user._id);
    const { business, loyaltyProgram, loyaltyTiers, pointCurrency } = await this.getAllData(user._id);
    const subscription = await this.subscriptionService.getByUserId(user._id);
    const { places, poses } = await this.getPoses(merchant._id);
    const image = user.avatarFileId ? await this.fileRepository.getById(user.avatarFileId) : null;

    return {
      user: {
        ...user,
        image,
      },
      merchant,
      business,
      loyaltyProgram,
      loyaltyTiers,
      pointCurrency,
      subscription,
      places,
      poses,
    };
  }

  getCustomerStats(merchant: MerchantDbDto) {
    return this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(merchant._id) } },
        {
          $lookup: {
            from: 'businesses',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'customertiers',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'customerTier',
          },
        },
        { $unwind: '$customerTier' },
        {
          $lookup: {
            from: 'customers',
            localField: 'customerTier.customerId',
            foreignField: '_id',
            as: 'customer',
          },
        },
        { $unwind: '$customer' },
        {
          $project: {
            'planRef': 0,
            'userId': 0,
            'created_at': 0,
            'updated_at': 0,
            'user.created_at': 0,
            '__v': 0,
            'business': 0,
            '_id': 0,
          },
        },
        {
          $lookup: {
            from: 'loyaltytiers',
            let: { tierId: '$customerTier.tierId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$tierId'] } } },
              {
                $project: {
                  tierName: 1,
                },
              },
            ],
            as: 'loyaltyTier',
          },
        },
        { $unwind: '$loyaltyTier' },
        {
          $lookup: {
            from: 'users',
            let: { userId: '$customer.userId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
              {
                $project: {
                  avatarFileId: 1,
                  auth: 1,
                },
              },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            'customer.notificationsOn': 0,
            'customer.created_at': 0,
            'customer.updated_at': 0,
            'customer.__v': 0,
          },
        },
        {
          $lookup: {
            from: 'wallets',
            localField: 'customerTier._id',
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
                          { $eq: ['$type', WalletTransactionsTypeEnum.COUPON_DENIED] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'walletTransactionsSubTotal',
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
            as: 'walletTransactionsForEarnedPoints',
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
                          { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_CONVERTED] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'walletTransactionsForRedeemedPoints',
          },
        },
        {
          $project: {
            'customerTier.created_at': 1,
            'customer': 1,
            'user': 1,
            'loyaltyTier': 1,
            'pointsEarned': { $sum: '$walletTransactionsForEarnedPoints.cost' },
            'pointsRedeemed': { $sum: '$walletTransactionsForRedeemedPoints.cost' },
            'pointBalance': {
              $subtract: [
                { $sum: '$walletTransactionsSubTotal.cost' },
                { $sum: '$walletTransactionsForRedeemedPoints.cost' },
              ],
            },
          },
        },
        { $sort: { 'customerTier.created_at': -1 } },
      ],
    });
  }

  transactionsStats(merchant: MerchantDbDto) {
    return this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(merchant._id) } },
        {
          $lookup: {
            from: 'businesses',
            localField: '_id',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'customertiers',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'customerTier',
          },
        },
        { $unwind: '$customerTier' },
        {
          $lookup: {
            from: 'wallets',
            localField: 'customerTier._id',
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
                          { $eq: ['$type', WalletTransactionsTypeEnum.COUPON_CREATED] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'walletTransaction',
          },
        },
        { $unwind: '$walletTransaction' },
        {
          $lookup: {
            from: 'wallettransactionslogs',
            localField: 'walletTransaction._id',
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
            from: 'pos',
            localField: 'walletTransactionsLog.posId',
            foreignField: '_id',
            as: 'pos',
          },
        },
        {
          $unwind: {
            path: '$pos',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'coupons',
            localField: 'walletTransaction._id',
            foreignField: 'transactionId',
            as: 'coupon',
          },
        },
        {
          $unwind: {
            path: '$coupon',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            walletTransaction: 1,
            walletTransactionsLog: 1,
            customer: 1,
            pos: 1,
            coupon: 1,
          },
        },
        { $sort: { 'walletTransaction.created_at': -1 } },
      ],
    });
  }

  async updateSelf(
    tokenUser: PublicUserDto,
    merchant: MerchantDbDto,
    { user, business, subscription }: Partial<UpdateMerchantDto>,
  ): Promise<Partial<PublicMerchantDto>> {
    const response = {};

    if (!_.isEmpty(user)) {

      if (_.get(user, 'auth.email')) {
        const isEmailExist = await this.usersService.exist({ 'auth.email': _.get(user, 'auth.email') });

        if (isEmailExist) {
          throw new BadRequestException('Email already exist');
        }
      }
      const data = this.usersService.returnPublicUser(user);
      const updatedUser = await this.usersService.update(tokenUser._id, data);

      _.set(response, 'user', this.usersService.returnPublicUser(updatedUser));
    }

    if (!_.isEmpty(business)) {

      if (_.get(business, 'brandName')) {
        const isBrandNameExists = await this.businessService.exist({ brandName: _.get(business, 'brandName') });

        if (isBrandNameExists) {
          throw new BadRequestException('Brand Name already exist');
        }
      }

      _.set(response, 'business', await this.businessService.updateByMerchantId(merchant._id, business));
    }

    if (!_.isEmpty(subscription)) {
      const dbSubscription = await this.subscriptionService.getByUserId(tokenUser._id);

      _.set(response, 'subscription', await this.subscriptionService.updatePeriod(dbSubscription, subscription));
    }

    return response;
  }

  async addPaymentMethod(merchant, token): Promise<CardInterface> {
    const cards = await this.getPaymentList(merchant);

    if (_.size(cards.data) > 0 ) {
      throw new ForbiddenException('Cart can\'t be added.');
    }

    return this.stripeService.createCard(merchant.stripeId, token.id);
  }

  getPaymentList(merchant): Promise<CardList> {
    return this.stripeService.getCardList(merchant.stripeId);
  }

  async submitPayment(user: PublicUserDto, merchant: MerchantDbDto, card: string): Promise<TransactionInterface> {
    const business = await this.businessService.getByMerchantId(merchant._id);

    return this.subscriptionService.payment(merchant._id, merchant.stripeId, card, {businessId: business._id, email: user.auth.email});
  }

  deletePayment(merchant, card): Promise<DeleteCardInterface> {
    return this.stripeService.deleteCard(merchant.stripeId, card);
  }

  async uploadBrandNameImage(merchantId: MerchantDbDto['_id'], data: CreateFileDto): Promise<BusinessDto> {
    const file = await this.fileRepository.create(data);
    const business = await this.businessService.updateByMerchantId(merchantId, { imageId: file._id });
    return {
      ...business,
      image: file,
    };
  }
}
