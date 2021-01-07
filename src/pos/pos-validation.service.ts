import * as _ from 'lodash';
import config from '../../config';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DbModel } from '../../util/modelWrapper';
import { PosDbDto } from './dto/pos-db.dto';
import { CouponService } from '../coupon/coupon.service';
import { PosService } from './pos.service';
import { CouponStatusEnum } from '../coupon/enum/coupon-status.enum';
import { CouponDbDto } from '../coupon/enum/coupon-db.dto';
import { PosOperationsMap, PosStatusEnum, PosStatusMethodEnum } from '../merchant/enum/pos-status.enum';
import { MerchantService } from '../merchant/merchant.service';
import { MerchantDbDto } from '../merchant/dto/merchant-db.dto';
import { PublicUserDto } from '../users/dto/public-user.dto';
import redis from '../../util/redis';
import { UsersService } from '../users/users.service';
import { BusinessDbDto } from '../business/dto/business-db.dto';
import { invitePosTokenMask } from '../../util/globals';
import { BusinessService } from '../business/business.service';

/**
 * Pos Service
 */
@Injectable()
export class PosValidationService {
  /**
   * @param posModel
   * @param couponService
   * @param posService
   * @param merchantService
   * @param usersService
   * @param businessService
   */
  constructor(
    @InjectModel('Pos') private readonly posModel: Model<PosDbDto>,
    private readonly couponService: CouponService,
    private readonly posService: PosService,
    private readonly merchantService: MerchantService,
    private readonly usersService: UsersService,
    private readonly businessService: BusinessService,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.posModel);

  async baseValidation(user): Promise<{ pos: PosDbDto }> {
    const pos = await this.posService.getByUserId(user._id);

    if (!pos) {
      throw new ForbiddenException();
    }

    if (pos.status !== PosStatusEnum.ACTIVE) {
      throw new ForbiddenException();
    }

    return {
      pos,
    };
  }

  async canCouponBePressed(pos, couponUuid): Promise<{ coupon: CouponDbDto }> {
    const coupon = await this.couponService.getByQuery({ uuid: couponUuid, placeId: pos.placeId, status: CouponStatusEnum.REDEEMED });

    if (!coupon) {
      throw new BadRequestException('bad coupon');
    }

    const business = await this.businessService.getBusinessData(coupon.businessId);

    if (!business || business.loyaltyProgram.isActive === false) {
      throw new NotFoundException('business not found');
    }

    if (coupon.status !== CouponStatusEnum.REDEEMED) {
      throw new BadRequestException('bad coupon');
    }

    return {
      coupon,
    };
  }

  async canPosStatusBeChanged(
    user: PublicUserDto,
    posId: string,
    operation: {
      method: PosStatusMethodEnum,
      newStatus: PosStatusEnum,
    },
  ): Promise<{ merchant: MerchantDbDto, pos: PosDbDto, business: BusinessDbDto, place: PosDbDto }> {
    const merchant = await this.merchantService.getByUserId(user._id);

    const data = _.first(await this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(posId) } },
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
        { $match: { 'business.merchantId': Types.ObjectId(merchant._id) } },
      ],
    }));

    if (_.isEmpty(data)) {
      throw new BadRequestException(`Uncached Error`);
    }

    const { business, place, ...pos } = data;

    const operationMap = _.get(PosOperationsMap, operation.method);

    if (_.isEmpty(operationMap)) {
      throw new ForbiddenException(`You can't do ${operation.method}`);
    }

    const currentOperationMap = {
      status: [pos.status],
      newStatus: [operation.newStatus],
    };

    if (!_.isEqual(
      [_.some(currentOperationMap.status, (x) => _.includes(operationMap.status, x)),
        _.some(currentOperationMap.newStatus, (x) => _.includes(operationMap.newStatus, x))],
      [true, true],
    )) {
      throw new ForbiddenException(`You can't change status to ${operation.newStatus}`);
    }

    return {
      merchant,
      pos,
      business,
      place,
    };
  }

  async canDeepLinkBeOpen(link: string): Promise<boolean> {
    const token = _.replace(link, `${config.appLinks.mobPosLink}/`, '');

    const keys = await redis.keysAsync(`${invitePosTokenMask}*::${token}`);
    const key = _.first(keys);

    const storedTokenData = await redis.getAsync(key);

    if (_.isEmpty(storedTokenData)) {
      return false;
    }

    const { email } = JSON.parse(storedTokenData);

    if (_.isNil(email)) {
      return false;
    }
    const user = await this.usersService.getByEmail(email);

    if (_.isEmpty(user)) {
      return false;
    }

    const pos = await this.posService.getByUserId(user._id);

    if (_.isEmpty(pos)) {
      return false;
    }

    return pos.status === PosStatusEnum.PENDING || pos.status === PosStatusEnum.INVITE_CANCELLED;
  }
}
