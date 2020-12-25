import * as mongoose from 'mongoose';

/** wallet mongoose schema */
export const WallerSchema = new mongoose.Schema(
  {
    customerTierId: {
      type: 'ObjectId',
      ref: 'customerTier',
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
