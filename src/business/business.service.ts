import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessDbDto } from './dto/business-db.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { DbModel } from '../../util/modelWrapper';
import { BusinessDataDto } from './dto/business-data.dto';
import { PosStatusEnum } from '../merchant/enum/pos-status.enum';
import { BusinessDto } from './dto/business.dto';
import { FilesRepository } from '../filel/files.repository';
import { PublicBusinessDto } from './dto/public-business.dto';

/** lodash */
const _ = require('lodash');

/** business service */
@Injectable()
export class BusinessService {
  /**
   * BusinessService
   * @param {BusinessService} businessModel - inject
   * @param filesRepository
   */
  constructor(
    @InjectModel('Business') private readonly businessModel: Model<BusinessDbDto>,
    private readonly filesRepository: FilesRepository,
  ) {
  }

  readonly model = new DbModel(this.businessModel);

  /**
   * exist func
   * @param {Partial<BusinessDbDto>} filter - filter to search
   * @returns {Promise<boolean>}
   */
  exist(filter: Partial<BusinessDbDto>): Promise<boolean> {
    return this.businessModel.exists(filter);
  }

  async create(data: CreateBusinessDto): Promise<BusinessDbDto> {
    if (await this.exist({ brandName: _.get(data, 'brandName') })) {
      throw new HttpException('brand already exists', HttpStatus.CONFLICT);
    }

    return await this.model.insertRow({ data });
  }

  async getByMerchantId(merchantId: string): Promise<BusinessDbDto> {
    return await this.model.findRow({
      query: {
        merchantId,
      },
    });
  }

  async getCurrentQuantityOfPos(businessId): Promise<number> {
    const qty = await this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(businessId) } },
        {
          $lookup: {
            from: 'merchants',
            localField: 'merchantId',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        { $unwind: '$merchant' },
        {
          $lookup: {
            from: 'places',
            localField: '_id',
            foreignField: 'businessId',
            as: 'places',
          },
        },
        { $unwind: '$places' },
        {
          $lookup: {
            from: 'pos',
            localField: 'places._id',
            foreignField: 'placeId',
            as: 'poses',
          },
        },
        { $unwind: '$poses' },
        {
          $match: {
            $expr: {
              $in: ['poses.status', [PosStatusEnum.ACTIVE, PosStatusEnum.REVOKED]],
            },
          },
        },
        { $count: 'count' },
      ],
    });

    return _.chain(qty).first().get('count', 0).value();
  }

  async getMaxQuantityOfPos(businessId): Promise<number> {
    const qty = await this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(businessId) } },
        {
          $lookup: {
            from: 'merchants',
            localField: 'merchantId',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        { $unwind: '$merchant' },
        {
          $lookup: {
            from: 'subscriptions',
            localField: 'merchant._id',
            foreignField: 'merchantId',
            as: 'subscription',
          },
        },
        { $unwind: '$subscription' },
        {
          $group: {
            _id: null,
            count: { $last: '$subscription.quantityOfPos' },
          },
        },
        { $project: { _id: 0 } },
        { $unwind: '$count' },
      ],
    });

    return _.chain(qty).first().get('count').value();
  }

  canPosBeAdded = async (businessId: string): Promise<boolean> =>
    await this.getCurrentQuantityOfPos(businessId) < await this.getMaxQuantityOfPos(businessId)

  async getBusinessData(id: string): Promise<PublicBusinessDto> {
    const data = _.first(await this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'loyaltyprograms',
            localField: '_id',
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
            localField: '_id',
            foreignField: 'businessId',
            as: 'pointCurrency',
          },
        },
        { $unwind: '$pointCurrency' },
        {
          $lookup: {
            from: 'places',
            localField: '_id',
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
                      { $in: ['$status', [PosStatusEnum.ACTIVE, PosStatusEnum.REVOKED]] },
                    ],
                  },
                },
              },
            ],
            as: 'pos',
          },
        },
        {
          $lookup: {
            from: 'places',
            localField: 'pos.placeId',
            foreignField: '_id',
            as: 'places',
          },
        },
      ],
    }));

    const image = data.imageId ? await this.filesRepository.getById(data.imageId) : null;
    return {
      ...data,
      image,
    };
  }

  getBusinessesDataNoEqIds(ids): Promise<BusinessDataDto[]> {
    return this.model.aggregateRows({
        query: [
          {
            $match: {
              _id: {
                $not: {
                  $in: _.map(ids, (id) => Types.ObjectId(id)),
                },
              },
            },
          },
          {
            $sort: { created_at: -1 },
          },
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
          {
            $lookup: {
              from: 'loyaltyprograms',
              let: { businessId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$businessId', '$$businessId'] },
                        { $eq: ['$isActive', true] },
                      ],
                    },
                  },
                },
              ],
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
      },
    );
  }

  updateByMerchantId(id: string, data: Partial<BusinessDbDto>): Promise<BusinessDto> {
    return this.model.updateRow({ query: { merchantId: Types.ObjectId(id) }, data });
  }
}
