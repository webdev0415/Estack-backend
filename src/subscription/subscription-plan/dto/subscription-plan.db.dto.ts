import { Document } from 'mongoose';
import { PaymentCycleEnum } from '../../enum/paymentCycle.enum';
import { SubscriptionPlanTypeEnum } from '../../enum/subscription-plan-type.enum';

export interface SubscriptionPlanDbDto extends Document {
  _id: string;
  price: number;
  type: SubscriptionPlanTypeEnum;
  period: PaymentCycleEnum;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
