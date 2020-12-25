import * as mongoose from 'mongoose';
import { WalletTransactionsTypeEnum } from '../wallet-transactions/enum/wallet-transactions-type.enum';
import { CurrencyEnum } from '../../util/globals/enums/currency.enum';

/** Waller Transactions logs mongoose schema */
export const WalletTransactionsLogsSchema = new mongoose.Schema(
  {
    id: {
      type: 'String',
      required: true,
    },
    customerId: {
      type: 'ObjectId',
      ref: 'Customer',
      required: true,
    },
    posId: {
      type: 'ObjectId',
      ref: 'Pos',
      default: null,
    },
    businessId: {
      type: 'ObjectId',
      ref: 'Business',
      default: null,
    },
    transactionId: {
      type: 'ObjectId',
      ref: 'WalletTransactions',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      enum: Object.values(CurrencyEnum),
      default: CurrencyEnum.POINTS,
    },
    currencyAmount: {
      type: Number,
      default: false,
    },
    type: {
      type: String,
      enum: Object.values(WalletTransactionsTypeEnum),
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
