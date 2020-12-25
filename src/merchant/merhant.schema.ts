import * as mongoose from 'mongoose';

/** merchant mongoose schema */
export const MerchantSchema = new mongoose.Schema(
  {
    userId: {
      type: 'ObjectId',
      ref: 'user' ,
      required: true,
    },
    planRef: {
      type: String,
      default: null,
    },
    stripeId: {
      type: String,
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
