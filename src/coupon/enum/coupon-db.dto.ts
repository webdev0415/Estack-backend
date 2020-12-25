import { Document } from 'mongoose';
import { CouponStatusEnum } from './coupon-status.enum';

export interface CouponDbDto extends Document {
  _id: string;
  status: CouponStatusEnum;
  startDate: string;
  expireDate: string;
  cost: number;
  type: string;
  uuid: string;
  qrCode: string;
  placeId: string;
  transactionId: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}
