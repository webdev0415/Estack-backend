import * as mongoose from 'mongoose';

/** loyalty program schema */
export const LoyaltyProgramSchema = new mongoose.Schema(
  {
    businessId: {
      type: 'ObjectId',
      ref: 'Business',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
