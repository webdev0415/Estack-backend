import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubscriptionDbDto } from './dto/subscription-db.dto';
import { DbModel } from '../../util/modelWrapper';

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectModel('Subscription') private readonly subscriptionModel: Model<SubscriptionDbDto>,
  ) {}

  private readonly subscription = new DbModel(this.subscriptionModel);

  create(data) {
    return this.subscription.insertRow({ data });
  }

  updateOne(query, data) {
     return this.subscription.findAndUpdateOne(query, data);
  }

  updateMany(query, data) {
    return this.subscription.updateMany(query, data);
  }

  getBy(query) {
    return this.subscription.findRows({ query });
  }

  getOne(query) {
    return this.subscription.findRow({ query });
  }

  aggregateByUserId(userId: string) {
    return this.subscription.aggregateRows({
      query: [
        {
          $lookup: {
            from: 'merchants',
            localField: 'merchantId',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        { $unwind: '$merchant' },
        { $match: { 'merchant.userId': Types.ObjectId(userId) } },
      ],
    });
  }
}
