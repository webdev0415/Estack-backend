import * as mongoose from 'mongoose';

/** Customer Tier mongoose schema */
export const CustomerTierSchema = new mongoose.Schema(
  {
    tierId: {
      type: 'ObjectId',
      ref: 'LoyaltyTier',
      required: true,
    },
    customerId: {
      type: 'ObjectId',
      ref: 'Customer',
      required: true,
    },
    businessId: {
      type: 'ObjectId',
      ref: 'Business',
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
