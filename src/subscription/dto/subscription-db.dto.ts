import { Document } from 'mongoose';

/** Subscription that was returned from db and contains sensitive information */
export interface SubscriptionDbDto extends Document {
  /** id */
  _id: string;
  /** merchantId */
  merchantId: string;
  /** startOfSubscription - start of first subscription */
  startOfSubscription: Date;
  /** endOfSubscription - end of first subscription */
  endOfSubscription: Date;
  /** currentStart - start of current payment cycle */
  currentStart: Date;
  /** currentEnd - end of current payment cycle */
  currentEnd: Date;
  /** isActive - is active subscription */
  isActive: boolean;
  /** paidCount - how many times subscription was bought */
  paidCount: number;
  /** notifyAt - when merchant will be notified */
  notifyAt: Date;
  /** chargedAt - when was last payment */
  chargedAt: Date;
  /** quantityOfPos */
  quantityOfPos: number;
  /** subscriptionPlanId - enterprise|boutique|individual plan _id */
  subscriptionPlanId: string;

  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
