import * as mongoose from 'mongoose';
import { WalletTransactionsTypeEnum } from './enum/wallet-transactions-type.enum';

/** WallerTransactions mongoose schema */
export const WalletTransactionsSchema = new mongoose.Schema(
  {
    walletId: {
      type: 'ObjectId',
      ref: 'Wallet',
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: Object.values(WalletTransactionsTypeEnum),
      required: true,
    },
    posId: {
      type: 'ObjectId',
      ref: 'Pos',
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
