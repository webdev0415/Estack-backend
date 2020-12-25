import { Document } from 'mongoose';
import { PointCurrencyLifeTimeEnum } from '../enum/point-currency-life-time.enum';

export interface PointCurrencyDbDto extends Document {
  lifeTime: PointCurrencyLifeTimeEnum;
  calcFactor: number;
  maxPurchase: number;
  maxPurchaseDay: number;
  businessId: string;
}
