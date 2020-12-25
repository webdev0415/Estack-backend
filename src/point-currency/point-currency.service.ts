import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PointCurrencyDbDto } from './dto/point-currency-db.dto';
import { DbModel } from '../../util/modelWrapper';

@Injectable()
export class PointCurrencyService {
  constructor(
    @InjectModel('PointCurrency') private readonly pointCurrencyModel: Model<PointCurrencyDbDto>,
  ) {
  }

  readonly model = new DbModel(this.pointCurrencyModel);

  create(businessId): Promise<PointCurrencyDbDto> {
    return this.model.insertRow({ data: { businessId } });
  }

  update(pointCurrencyId, data: Partial<PointCurrencyDbDto>): Promise<PointCurrencyDbDto> {
    return this.model.updateRow({ query: { _id: Types.ObjectId(pointCurrencyId) }, data });
  }
}
