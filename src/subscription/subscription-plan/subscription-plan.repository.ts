import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubscriptionPlanDbDto } from './dto/subscription-plan.db.dto';
import { DbModel } from '../../../util/modelWrapper';
import { CreateSubscriptionPlanDto } from './dto/create.subscription-plan.dto';
import { SubscriptionPlanDto } from './dto/subscription-plan.dto';
import { PaginationSubscriptionPlanDto } from './dto/pagination.subscription-plan.dto';

@Injectable()
export class SubscriptionPlanRepository {
  constructor(
    @InjectModel('subscriptions.plan') private readonly subscriptionPlanModel: Model<SubscriptionPlanDbDto>,
  ) {}

  private readonly subscriptionPlan = new DbModel(this.subscriptionPlanModel);

  create(data: CreateSubscriptionPlanDto) {
    return this.subscriptionPlan.insertRow({ data });
  }

  getFirstBy(query) {
    return this.subscriptionPlan.findRow({ query });
  }

  getBy(query) {
    return this.subscriptionPlan.findRows({ query });
  }

  pagination(options: PaginationSubscriptionPlanDto) {
    return this.subscriptionPlan.findWithOptions({ query: {}, options });
  }

  updatePlan(id: string, data: Partial<SubscriptionPlanDto>) {
    return this.subscriptionPlan.updateRow({ query: {_id: Types.ObjectId(id)}, data });
  }

  deletePlan(id: string) {
    return this.subscriptionPlan.deleteRow({ query: {_id: Types.ObjectId(id)} });
  }

  getSubscriptionEmails(id?: string) {

    const matchObj = {$match: {}};

    if (id) {
      matchObj.$match = { _id : Types.ObjectId(id) };
    }

    return this.subscriptionPlan.aggregateRows({
      query: [
        matchObj,
        {
          $lookup: {
            from: 'subscriptions',
            localField: '_id',
            foreignField: 'subscriptionPlanId',
            as: 'subscriptions',
          },
        },
        { $unwind: '$subscriptions' },
        {
          $lookup: {
            from: 'merchants',
            localField: 'subscriptions.merchantId',
            foreignField: '_id',
            as: 'merchants',
          },
        },
        { $addFields: { merchants: { $arrayElemAt: [ '$merchants', 0 ] }} },
        {
          $lookup: {
            from: 'users',
            localField: 'merchants.userId',
            foreignField: '_id',
            as: 'users',
          },
        },
        { $addFields: { users: { $arrayElemAt: [ '$users', 0 ] }} },
        { $group: {
            _id: '$_id',
            data: {$push: {
              userId: '$users._id',
              email: '$users.auth.email',
              merchantId: '$merchants._id',
              subscriptionId: '$subscriptions._id'}},
          } },
      ],
    });
  }
}
