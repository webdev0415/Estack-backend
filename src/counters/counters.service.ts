import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CountersDbDto } from './dto/counters-db.dto';

@Injectable()
export class CountersService {
  constructor(
    @InjectModel('Counters') private readonly countersModel: Model<CountersDbDto>,
  ) {
  }

  async getNextVal(sequenceName: string) {
    const sequenceDocument = await this.countersModel.findByIdAndUpdate(
      sequenceName,
      { $inc: { sequenceValue: 1 }, _id: sequenceName},
      {
        new: true,
        upsert: true,
      },
    );

    return _.get(sequenceDocument, 'sequenceValue');
  }
}
