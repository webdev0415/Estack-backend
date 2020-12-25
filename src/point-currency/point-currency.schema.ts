import * as mongoose from 'mongoose';
import { PointCurrencyLifeTimeEnum } from './enum/point-currency-life-time.enum';

/** Point Currency mongoose schema */
export const PointCurrencySchema = new mongoose.Schema(
  {
    lifeTime: {
      type: String,
      default: PointCurrencyLifeTimeEnum.NEVER,
    },
    calcFactor: {
      type: Number,
      default: 0.1,
    },
    maxPurchase: {
      type: Number,
      default: 250,
    },
    maxPurchaseDay: {
      type: Number,
      default: 2500,
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
