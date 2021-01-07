import * as _ from 'lodash';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoyaltyTierDbDto } from './dto/loyalty-tier-db.dto';
import { DbModel } from '../../util/modelWrapper';
import { CreateLoyaltyTierDto } from './dto/create-loyalty-tier.dto';
@Injectable()
export class LoyaltyTierService {
  /**
   * LoyaltyTierService
   * @param loyaltyTierModel
   */
  constructor(
    @InjectModel('LoyaltyTier') private readonly loyaltyTierModel: Model<LoyaltyTierDbDto>,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.loyaltyTierModel);

  /**
   * create func - creates row in model
   * @param {CreateLoyaltyTierDto} data
   * @returns {Promise<LoyaltyTierDbDto>}
   */
  create(data: CreateLoyaltyTierDto): Promise<LoyaltyTierDbDto> {
    return this.model.insertRow({ data });
  }

  /**
   * getById func - returns row from model
   * @param {string} id
   * @returns {Promise<LoyaltyTierDbDto>}
   */
  getById(id: string): Promise<LoyaltyTierDbDto> {
    return this.model.findById({ id });
  }

  /**
   * getTier func - returns row from model by businessId
   * @returns {Promise<LoyaltyTierDbDto>}
   * @param {string} businessId
   * @param {string} tierLevel
   */
  getTier(businessId: string, tierLevel: number): Promise<LoyaltyTierDbDto[]> {
    return this.model.aggregateRows({
      query: [
        { $match: { tierLevel } },
        {
          $lookup: {
            from: 'loyaltyprograms',
            localField: 'loyaltyProgramId',
            foreignField: '_id',
            as: 'loyaltyProgram',
          },
        },
        { $unwind: '$loyaltyProgram' },
        { $match: { 'loyaltyProgram.businessId': Types.ObjectId(businessId) } },
        {
          $project: {
            loyaltyProgram: false,
          },
        },
      ],
    });
  }

 async update(tierId: string, data: Partial<CreateLoyaltyTierDto>): Promise<LoyaltyTierDbDto> {

    const tier: LoyaltyTierDbDto = await this.model.findRow({ query: { _id: Types.ObjectId(tierId) } });

    if (tier.tierLevel === 1) {
      if (_.chain(data).keys().pull('tierName').size().value() > 0) {
        throw new BadRequestException();
      }
    }

    return this.model.updateRow({ query: { _id: Types.ObjectId(tierId) }, data });
  }
}
