import * as moment from 'moment';
import {Schema, Types} from 'mongoose';

/** Subscription mongoose schema */
export const SubscriptionSchema = new Schema(
  {
    merchantId: {
      type: Types.ObjectId,
      ref: 'Merchant',
      required: true,
    },
    subscriptionPlanId: {
      type: Types.ObjectId,
      ref: 'subscriptions.plan',
      required: true,
    },
    endOfSubscription: {
      type: Date,
      default: moment().toISOString(),
    },
    currentEnd: {
      type: Date,
      default: moment().toISOString(),
    },
    paidCount: {
      type: Number,
      default: 0,
    },
    quantityOfPos: {
      type: Number,
      required: true,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    customerCount: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
