import { Document } from 'mongoose';

/** place that was returned from db and contains sensitive information */
export interface LoyaltyProgramDbDto extends Document {
  /** id */
  _id: string;
  /** businessId */
  businessId: string;
  /** name */
  isActive: boolean;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
