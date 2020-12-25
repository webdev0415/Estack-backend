import { Document } from 'mongoose';

/** Loyalty Tier that was returned from db and contains sensitive information */
export interface LoyaltyTierDbDto extends Document {
  /** id */
  _id: string;
  /** tierName */
  tierName: string;
  /** tierLevel */
  tierLevel: number;
  /** multiplier */
  multiplier: number;
  /** spendThreshold */
  spendThreshold: number;
  /** pointThreshold */
  pointThreshold: number;
  /** welcomeReward */
  welcomeReward: number;
  /** bornDayReward */
  bornDayReward: number;
  /** status */
  status: string;
  /** imageFileId */
  imageFileId: string;
  /** loyaltyProgramId */
  loyaltyProgramId: string;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
