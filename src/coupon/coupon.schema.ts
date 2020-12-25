import * as mongoose from 'mongoose';
import { CouponStatusEnum } from './enum/coupon-status.enum';
import config from '../../config/index';

/** Coupon mongoose schema */
export const CouponSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(CouponStatusEnum),
      default: CouponStatusEnum.CREATED,
      required: true,
    },
    startDate: {
      type: Date,
      default: new Date(),
    },
    expireDate: {
      type: Date,
      default: new Date(new Date().getTime() + config.coupon.lifeTimeH * 3600000).toISOString(),
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    type: { // now unused
      type: String,
      default: null,
    },
    uuid: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
      default: null,
    },
    placeId: {
      type: 'ObjectId',
      ref: 'Place',
      default: null,
    },
    transactionId: {
      type: 'ObjectId',
      ref: 'WalletTransactions',
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
