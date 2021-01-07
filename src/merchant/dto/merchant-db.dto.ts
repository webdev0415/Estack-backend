import { Document } from 'mongoose';

/** merchant that was returned from db and contains sensitive information */
export interface MerchantDbDto extends Document {
  /** id */
  _id: string;
  /** userId */
  userId: string;
  /** stripeId */
  stripeId: string;
  /** planRef */
  planRef: string;
  /** businessId */
  businessId: string;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
