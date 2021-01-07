import * as mongoose from 'mongoose';
import { CurrencyEnum } from '../../util/globals/enums/currency.enum';

/** business mongoose schema */
export const BusinessSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
    },
    county: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      default: CurrencyEnum.DOLLARS,
      required: false,
      enum: Object.values(CurrencyEnum),
    },
    imageId: {
      type: 'ObjectId',
      ref: 'Files',
      required: false,
      default: null,
    },
    merchantId: {
      type: 'ObjectId',
      ref: 'Merchant',
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
