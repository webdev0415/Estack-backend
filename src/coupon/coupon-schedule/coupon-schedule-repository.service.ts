import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CouponDbDto } from '../enum/coupon-db.dto';
import { DbModel } from '../../../util/modelWrapper';
import * as _ from 'lodash';
import { IJob } from './coupon-schedule';
import { CouponStatusEnum } from '../enum/coupon-status.enum';

@Injectable()
export class CouponScheduleRepository {
  constructor(
    @InjectModel('Coupon') private readonly couponModel: Model<CouponDbDto>,
  ) {
  }

  private readonly model = new DbModel(this.couponModel);

  async getJobListForGivenTimePeriod({ startTimeMs, endTimeMs }): Promise<IJob[]> {
    const data = await this.model.findRows({
      query: {
        $and: [
          { expireDate: { $gte: new Date(startTimeMs).toISOString() } },
          { expireDate: { $lte: new Date(endTimeMs).toISOString() } },
          { status: { $in: [CouponStatusEnum.CREATED, CouponStatusEnum.REDEEMED]} },
        ],
      },
    });

    return _.map(data, (x) => ({ id: x._id, timeWhenTheJobWillBeCalled: x.expireDate }));
  }

  scheduledJob({ id }: IJob) {
    this.model.updateRow({
      query: {
        $and: [
          { _id: Types.ObjectId(id) },
          { status: { $in: [CouponStatusEnum.CREATED, CouponStatusEnum.REDEEMED]} },
        ],
      },
      data: { status: CouponStatusEnum.EXPIRED },
    });
  }
}
