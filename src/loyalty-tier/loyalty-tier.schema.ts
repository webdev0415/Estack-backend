import * as mongoose from 'mongoose';

/** Loyalty Tier mongoose schema */
export const LoyaltyTierSchema = new mongoose.Schema(
  {
    loyaltyProgramId: {
      type: 'ObjectId',
      ref: 'LoyaltyProgram',
      required: true,
    },
    tierName: {
      type: String,
      required: true,
    },
    tierLevel: {
      type: Number,
      required: true,
    },
    multiplier: {
      type: Number,
      required: true,
    },
    spendThreshold: {
      type: Number,
      required: true,
    },
    pointThreshold: {
      type: Number,
      required: true,
    },
    welcomeReward: {
      type: Number,
      default: null,
    },
    bornDayReward: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    imageFileId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
