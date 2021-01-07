import * as _ from 'lodash';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IJob } from './subscription-schedule';
import { DbModel } from '../../../util/modelWrapper';

import config from '../../../config';
import { SubscriptionDbDto } from '../dto/subscription-db.dto';
import { LoyaltyProgramDbDto } from '../../loyalty-program/dto/loyalty-program-db.dto';

@Injectable()
export class SubscriptionScheduleRepository {
  expireTimeFieldName = 'currentEnd';

  constructor(
    @InjectModel('Subscription') private readonly subscriptionDbDtoModel: Model<SubscriptionDbDto>,
    @InjectModel('LoyaltyProgram') private readonly loyaltyProgramDbDtoModel: Model<LoyaltyProgramDbDto>,
  ) {}

  private readonly subscriptionModel = new DbModel(this.subscriptionDbDtoModel);
  private readonly loyaltyProgramModel = new DbModel(this.loyaltyProgramDbDtoModel);

  async updateLoyaltyProgram(query, data)  {
    return  this.loyaltyProgramModel.findAndUpdateOne(  query, data );
  }

  async getMerchantsCustomerCount()  {
    return this.subscriptionModel.aggregateRows({
      query: [
        {
          $match: {customerCount: { $ne: config.customersNumThreshold }, isActive: true},
        },
        {
          $lookup: {
            from: 'merchants',
            localField: 'merchantId',
            foreignField: '_id',
            as: 'merchants',
          },
        },
        { $addFields: { merchants: { $arrayElemAt: [ '$merchants', 0 ] }} },
        {
          $lookup: {
            from: 'businesses',
            localField: 'merchantId',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $addFields: { business: { $arrayElemAt: [ '$business', 0 ] }} },
        {
          $lookup: {
            from: 'customertiers',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'customerTier',
          },
        },
        { $addFields: { count: {$size: '$customerTier'}} },
        {$match: {$expr:  {$gte: ['$count', config.customersNumThreshold]}}},
        {
          $lookup: {
            from: 'users',
            localField: 'merchants.userId',
            foreignField: '_id',
            as: 'users',
          },
        },
        { $addFields: { users: { $arrayElemAt: [ '$users', 0 ] }} },
        {
          $project: {
            _id: '$merchants._id',
            stripeId: '$merchants.stripeId',
            email: '$users.auth.email',
            count: 1,
          },
        },
      ]});
  }

  async getFinishedSubscriptions()  {
    const time = moment().toISOString();

    return this.subscriptionModel.aggregateRows({
      query: [
        {
          $match: { customerCount: config.customersNumThreshold, isActive: true,
            $expr:  { $lt: [{ $toDate: '$endOfSubscription' }, { $toDate: time }] }},
        },
        {
          $lookup: {
            from: 'merchants',
            localField: 'merchantId',
            foreignField: '_id',
            as: 'merchants',
          },
        },
        { $addFields: { merchants: { $arrayElemAt: [ '$merchants', 0 ] }} },
        {
          $lookup: {
            from: 'businesses',
            localField: 'merchantId',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $addFields: { business: { $arrayElemAt: [ '$business', 0 ] }} },
        {
          $lookup: {
            from: 'users',
            localField: 'merchants.userId',
            foreignField: '_id',
            as: 'users',
          },
        },
        { $addFields: { users: { $arrayElemAt: [ '$users', 0 ] }} },
        {
          $project: {
            currentEnd: 1,
            _id: '$merchants._id',
            stripeId: '$merchants.stripeId',
            businessId: '$business._id',
            email: '$users.auth.email',
          },
        },
      ]});
  }

  async getJobListForGivenTimePeriod({ startTimeMs, endTimeMs }): Promise<IJob[]> {

    const data = await this.subscriptionModel.aggregateRows({
      query: [
        {
          $match: {
            [this.expireTimeFieldName]: { $gte: new Date(startTimeMs), $lte: new Date(endTimeMs) },
          },
        },
        {
          $lookup: {
            from: 'businesses',
            localField: 'merchantId',
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
        {
          $project: {
            _id: 1,
            [this.expireTimeFieldName]: 1,
            numOfCustomers: { $size: '$customerTier' },
          },
        },
        {
          $match: {
            numOfCustomers: { $gt: config.customersNumThreshold },
          },
        },
      ],
    });

    return _.map(data, (x) => ({ id: x._id, timeWhenTheJobWillBeCalled: x[this.expireTimeFieldName] }));
  }

  async scheduledJob({ id }: IJob): Promise<void> {
    this.subscriptionModel.updateRow({
      query: {
        $and: [
          { _id: Types.ObjectId(id) },
        ],
      },
      data: { isActive: false },
    });

    const data = await this.subscriptionModel.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'businesses',
            localField: 'merchantId',
            foreignField: 'merchantId',
            as: 'business',
          },
        },
        { $unwind: '$business' },
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
    });

    const loyaltyProgramId = _.get(_.first(data), 'loyaltyProgram._id');

    await this.loyaltyProgramModel.updateRow({
      query: { _id: Types.ObjectId(loyaltyProgramId) },
      data: { isActive: false },
    });
  }
}
