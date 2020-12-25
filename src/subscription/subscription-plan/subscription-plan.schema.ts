import {Schema} from 'mongoose';
import { PaymentCycleEnum } from '../enum/paymentCycle.enum';
import { SubscriptionPlanTypeEnum } from '../enum/subscription-plan-type.enum';

export const SubscriptionPlanSchema = new Schema({
    price: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: Object.values(SubscriptionPlanTypeEnum),
    },

    period: {
      type: String,
      required: true,
      enum: Object.values(PaymentCycleEnum),
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }).index({ type: 1, period: 1,  price: 1}, { unique: true });
