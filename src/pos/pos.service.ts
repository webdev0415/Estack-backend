import * as _ from 'lodash';
import * as moment from 'moment';
import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import redis from '../../util/redis';
import { InvitePosesDto } from './dto/invite-poses.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { DbModel } from '../../util/modelWrapper';
import { PosDbDto } from './dto/pos-db.dto';
import { JwtService } from '@nestjs/jwt';
import { InvitedPosesResponseDto } from './dto/invited-poses-response.dto';
import config from '../../config';
import { PlaceService } from '../place/place.service';
import { RolesEnum } from '../users/enums/roles.enum';
import { PublicPosDto } from './dto/public-pos.dto';
import { CreatePosDto } from './dto/create-pos.dto';
import { getRegPosPage } from '../../util/htmlPages/getRegPosPage';
import { emailRegex, formula, invitePosTokenMask, invitePosTokenPattern, sendEmail } from '../../util/globals';
import { MerchantService } from '../merchant/merchant.service';
import { BusinessService } from '../business/business.service';
import { AuthService } from '../auth/auth.service';
import { CryptoService } from '../../util/crypto/crypto/crypto.service';
import { WalletTransactionsService } from '../wallet-transactions/wallet-transactions.service';
import { WalletTransactionsTypeEnum } from '../wallet-transactions/enum/wallet-transactions-type.enum';
import { CurrencyEnum } from '../../util/globals/enums/currency.enum';
import { WalletTransactionsLogsService } from '../wallet-transactions-logs/wallet-transactions-logs.service';
import { CustomerTierService } from '../customer-tier/customer-tier.service';
import { UpdatePosResponseDto } from './dto/update-pos-response.dto';
import { CreatePlaceDto } from '../place/dto/create-place.dto';
import { CouponService } from '../coupon/coupon.service';
import { CountersService } from '../counters/counters.service';
import { CouponDbDto } from '../coupon/enum/coupon-db.dto';
import { PosStatusEnum } from '../merchant/enum/pos-status.enum';
import { CustomerDbDto } from '../customer/dto/customer-db.dto';
import { PlaceDbDto } from '../place/dto/place-db.dto';
import { LoyaltyTierService } from '../loyalty-tier/loyalty-tier.service';
import { CustomerService } from '../customer/customer.service';
import { GrandPointsDataDto } from './dto/grand-points-data.dto';
import { Gateway } from '../../util/gateway/gateway';
import { EventNamesEnum } from '../../util/gateway/enum/event-names.enum';

/** keygen */
const keygen = require('keygen');

/**
 * Pos Service
 */
@Injectable()
export class PosService {
  /**
   * @param posModel
   * @param {UsersService} usersService - inject
   * @param {PlaceService} placeService - inject
   * @param {BusinessService} businessService - inject
   * @param merchantService
   * @param {JwtService} jwtService - inject
   * @param cryptoService
   * @param {AuthService} authService - inject
   * @param walletTransactionsService
   * @param walletTransactionsLogsService
   * @param customerTierService
   * @param couponService
   * @param loyaltyTierService
   * @param seq
   * @param customerService
   * @param gateway
   */
  constructor(
    @InjectModel('Pos') private readonly posModel: Model<PosDbDto>,
    private readonly usersService: UsersService,
    private readonly placeService: PlaceService,
    private readonly businessService: BusinessService,
    private readonly merchantService: MerchantService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly cryptoService: CryptoService,
    private readonly walletTransactionsService: WalletTransactionsService,
    private readonly walletTransactionsLogsService: WalletTransactionsLogsService,
    private readonly customerTierService: CustomerTierService,
    private readonly couponService: CouponService,
    private readonly loyaltyTierService: LoyaltyTierService,
    private readonly seq: CountersService,
    private readonly customerService: CustomerService,
    private readonly gateway: Gateway,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.posModel);

  /**
   * getByUserId func - returns Pos user found by userId
   * @param userId
   * @returns {Promise<PosDbDto>}
   */
  getByUserId(userId: string): Promise<PosDbDto> {
    return this.model.findRow({ query: { userId } });
  }

  async getSelf(user): Promise<PublicPosDto> {
    const pos = await this.getByUserId(user._id);
    if (!pos) {
      throw new ForbiddenException();
    }

    const place = await this.placeService.getById(pos.placeId);
    const coupons = await this.couponService.getCouponsByPlaceId(place._id);
    const business = await this.businessService.getBusinessData(place.businessId);

    return {
      user,
      pos,
      place,
      coupons,
      business,
    };
  }

  /**
   * createPos func - set password for pos user
   * @param {CreatePosDto} data
   * @returns Promise<PublicPosDto>
   */
  async createPos(data: CreatePosDto): Promise<PublicPosDto> {
    const {
      token,
      password,
    } = data;

    const keys = await redis.keysAsync(`${invitePosTokenMask}*::${token}`);
    const key = _.first(keys);

    const storedTokenData = await redis.getAsync(key);

    if (_.isNil(storedTokenData)) {
      throw new HttpException('invalid token', HttpStatus.UNAUTHORIZED);
    }

    const { email, businessId } = JSON.parse(storedTokenData);

    if (!await this.usersService.exist({ 'auth.email': email })) {
      throw new HttpException('user does not exists', HttpStatus.NOT_FOUND);
    }

    if (!await this.businessService.canPosBeAdded(businessId)) {
      throw new HttpException('the maximum number of Pos Users has been reached', HttpStatus.CONFLICT);
    }

    const user = await this.usersService.getByEmail(email);
    const pos = await this.model.updateRow({
      query: { userId: Types.ObjectId(_.get(user, '_id')) },
      data: { status: PosStatusEnum.ACTIVE },
    });

    const place = await this.placeService.getById(_.get(pos, 'placeId'));

    const updatedUser = await this.usersService.update(_.get(user, '_id'), { password: this.cryptoService.saltPassword(user.salt, password) });
    await redis.delAsync(token);

    return {
      user: this.usersService.returnPublicUser(user),
      pos,
      place,
      business: await this.businessService.getBusinessData(place.businessId),
      ...await this.authService.genTokens(updatedUser),
      coupons: [],
    };
  }

  /**
   * invite func - call invitePos function for each email
   * and returns emails that was invited and was not invited
   *
   * @param {InvitePosesDto} posList
   * @param user
   * @returns {InvitedPosesResponseDto}
   */
  async invite(posList: InvitePosesDto, user): Promise<InvitedPosesResponseDto> {
    const emails = _.get(posList, 'emails');

    const { _id: merchantId, business: { _id: businessId }, subscription } = await this.merchantService.getAllData(user._id);
    const { poses } = await this.merchantService.getPoses(merchantId);

    if (_.size(posList) + _.size(poses) > subscription.quantityOfPos || _.size(poses) >= subscription.quantityOfPos) {
      throw new BadRequestException();
    }

    const result = await Promise.all(_.map(emails, (email) => this.invitePos(email, businessId)));

    return {
      invitedPoses: _.chain(result).filter(['wasInvited', true]).map('pos').value(),
      failedInvitation: _.chain(result).filter(['wasInvited', false]).map('email').value(),
    };
  }

  async grantPoints(userId, customerId, currencyAmount): Promise<number> {

    const data = _.first(await this.model.aggregateRows({
      query: [
        { $match: { userId: Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'places',
            localField: 'placeId',
            foreignField: '_id',
            as: 'place',
          },
        },
        { $unwind: '$place' },
        {
          $lookup: {
            from: 'businesses',
            localField: 'place.businessId',
            foreignField: '_id',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'pointcurrencies',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'pointCurrency',
          },
        },
        { $unwind: '$pointCurrency' },
        {
          $lookup: {
            from: 'customertiers',
            let: { businessId: '$business._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$customerId', Types.ObjectId(customerId)] },
                      { $eq: ['$businessId', '$$businessId'] },
                    ],
                  },
                },
              },
            ],
            as: 'customerTier',
          },
        },
        { $unwind: '$customerTier' },
        {
          $lookup: {
            from: 'loyaltytiers',
            localField: 'customerTier.tierId',
            foreignField: '_id',
            as: 'loyaltyTier',
          },
        },
        { $unwind: '$loyaltyTier' },
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
                      { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_EARNED] },
                      { $eq: ['$type', WalletTransactionsTypeEnum.COUPON_DENIED] },
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
        {
          $lookup: {
            from: 'wallettransactions',
            let: { walletId: '$wallet._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_EARNED] },
                      { $eq: ['$type', WalletTransactionsTypeEnum.COUPON_DENIED] },
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
            localField: 'loyaltyProgram._id',
            foreignField: 'loyaltyProgramId',
            as: 'loyaltyTiers',
          },
        },
      ],
    }));

    if (_.isEmpty(data)) {
      throw new BadRequestException();
    }

    const {
      business: { currency, brandName },
      pointCurrency: { maxPurchase, maxPurchaseDay },
      loyaltyTier: { _id: loyaltyTierId, multiplier, pointThreshold: currentPointThreshold },
      wallet,
      walletTransactionsOfCurrentDay,
      walletTransactions,
      loyaltyTiers,
      customerTier,
    } = data;

    const pointsAmount = formula.grandPoints(currencyAmount, multiplier);

    if (pointsAmount > maxPurchase) {
      throw new BadRequestException({
        type: 'TRANSACTION_LIMIT',
        currencyAmount,
        maxCurrencyAmount: formula.currencyAmountForGrantWithTierMultiplier(maxPurchase, multiplier),
      });
    }

    const userPointsEarned = _.sumBy(walletTransactions, 'cost');

    const userPointsEarnedToday = _.sumBy(walletTransactionsOfCurrentDay, 'cost');

    if (userPointsEarnedToday + pointsAmount > maxPurchaseDay) {
      throw new BadRequestException({
        type: 'DAY_LIMIT',
        currencyAmount,
        maxCurrencyAmount: formula.currencyAmountForGrantWithTierMultiplier((maxPurchaseDay - userPointsEarnedToday), multiplier),
      });
    }

    const newTier = _.find(
      loyaltyTiers,
      (x) => userPointsEarned + pointsAmount >= x.pointThreshold &&
        currentPointThreshold < x.pointThreshold &&
        !_.isEqual(loyaltyTierId, x._id) &&
        x.isActive === true,
    );

    if (!_.isNil(newTier)) {
      await this.customerTierService.updateTier(customerTier._id, newTier._id);
    }

    await this.walletTransactionsService.create({
      walletId: wallet._id,
      type: WalletTransactionsTypeEnum.POINTS_EARNED,
      posId: data._id,
      cost: pointsAmount,
      currency: CurrencyEnum.POINTS,
      customerId,
      businessId: data.business._id,
      text: `Earned points for a purchase of ${currency}${currencyAmount} at ${brandName}`,
      currencyAmount,
    });

    this.gateway.emitEvent(EventNamesEnum.POINT_GRANTED, {
      customerId,
      brandName,
      points: pointsAmount,
    });

    return pointsAmount;
  }

  /**
   * invitePos func - Send email and creates records in db for pos, if user exits in db and
   * write token to redis (key - token, value - { email, businessId }).
   * if user was noy invited returns false in wasInvited field
   * else returns false.
   * @param {string} email
   * @param {string} businessId
   * @returns {Promise<{email: string, wasInvited: boolean}>}
   */
  private async invitePos(email: string, businessId: string): Promise<{ email: string, wasInvited: boolean, pos?: PosDbDto }> {
    if (!emailRegex.test(email)) {
      return { email, wasInvited: false };
    }

    const isUserExists = await this.usersService.exist({ 'auth.email': email });

    if (isUserExists) {
      return { email, wasInvited: false };
    }

    const createdPlace = await this.placeService.create({ businessId });

    const createdUser = await this.usersService.create({
      email,
      ...this.cryptoService.hashPassword(keygen.url(16)),
      roles: [RolesEnum.POS],
    });

    const pos = await this.model.insertRow({
      data: {
        userId: _.get(createdUser, '_id'),
        placeId: _.get(createdPlace, '_id'),
        id: await this.seq.getNextVal('pos'),
      },
    });

    await this.sendInvitation(email, pos._id, businessId);

    return {
      email,
      pos: {
        ...pos,
        user: this.usersService.returnPublicUser(createdUser),
        place: createdPlace,
      },
      wasInvited: true,
    };
  }

  async getWalletTransactionsLogs(posId: string): Promise<{ points: number, coupons: number, gmv: number }> {
    const data = await this.walletTransactionsLogsService.getLogs({
      posId,
      created_at: { $gte: new Date(moment().startOf('day').toISOString()) },
    });
    let points = 0;
    let coupons = 0;
    let gmv = 0;

    _.forEach(data, (x) => {
      if (x.type === WalletTransactionsTypeEnum.POINTS_EARNED) {
        points += x.cost;
      }

      if (x.type === WalletTransactionsTypeEnum.COUPON_ACCEPTED) {
        coupons++;
        gmv += Math.abs(x.cost);
      }

    });
    return {
      points,
      coupons,
      gmv,
    };
  }

  async updateSelf(pos: PosDbDto, placeData: Partial<CreatePlaceDto>): Promise<UpdatePosResponseDto> {
    const location = {
      type: 'Point',
      coordinates: [placeData.lng, placeData.lat],
    };

    const place = await this.placeService.update(pos.placeId, _.merge(placeData, { location }));
    return {
      pos,
      place,
    };
  }

  async acceptCoupon(pos, coupon): Promise<CouponDbDto> {
    const place = await this.placeService.getById(pos.placeId);

    const business = await this.businessService.getBusinessData(place.businessId);

    return this.couponService.acceptCoupon(coupon, pos, business);
  }

  async denyCoupon(pos, coupon): Promise<CouponDbDto> {
    const place = await this.placeService.getById(pos.placeId);

    const business = await this.businessService.getBusinessData(place.businessId);

    return this.couponService.denyCoupon(coupon, pos, business);
  }

  changePosStatus(posId, newStatus: PosStatusEnum): Promise<PosDbDto> {
    return this.model.updateRow({ query: { _id: Types.ObjectId(posId) }, data: { status: newStatus } });
  }

  async resendInvite(pos, business): Promise<boolean | void> {
    const dbUser = await this.usersService.getById(pos.userId);

    return this.sendInvitation(dbUser.auth.email, pos._id, business._id);
  }

  async sendInvitation(email, posId, businessId): Promise<boolean | void> {
    const payload = { email, businessId };

    const token = this.jwtService.sign(payload);
    /** key - id + token, value - { email, businessId } */
    const key = invitePosTokenPattern(posId, token);
    await redis.setAsync([key, JSON.stringify(payload), 'EX', config.jwtExpire.posInviteSec]);

    return sendEmail(email, config.mail.data.posRegistration.subject, getRegPosPage(token));
  }

  async cancelPosInvitations(posId): Promise<void> {
    const keys = await redis.keysAsync(`${invitePosTokenMask}::${posId}*`);

    await Promise.all(_.map(keys, (key) => redis.delAsync(key)));
  }

  async getCustomerTier(customerId: CustomerDbDto['_id'], pos: PosDbDto): Promise<GrandPointsDataDto> {
    const { businessId }: PlaceDbDto = await this.placeService.getById(pos.placeId);
    const data = await this.customerService.getCustomerDetails(customerId);

    const customerTier = await this.customerTierService.getByQuery(
      {
        customerId: Types.ObjectId(customerId), businessId: Types.ObjectId(businessId),
      },
    );

    if (!customerTier) {
      throw new ForbiddenException('user doesnt join the shop');
    }

    const tier = await this.loyaltyTierService.getById(customerTier.tierId);
    return {
      user: data.user,
      customer: data.customer,
      tier: _.pick(tier, [
        'loyaltyProgramId',
        'tierName',
        'tierLevel',
        'multiplier',
        'spendThreshold',
        'pointThreshold',
        'isActive',
      ]),
    };
  }
}
