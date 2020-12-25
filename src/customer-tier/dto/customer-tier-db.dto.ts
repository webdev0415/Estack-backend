import { Document } from 'mongoose';

/** CustomerTier that was returned from db and contains sensitive information */
export interface CustomerTierDbDto extends Document {
  /** id */
  _id: string;
  /** tierId */
  tierId: string;
  /** customerId */
  customerId: string;
  /** businessId */
  businessId: string;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
