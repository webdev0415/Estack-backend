import * as mongoose from 'mongoose';
import { PosStatusEnum } from '../merchant/enum/pos-status.enum';

/** pos mongoose schema */
export const PosSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    userId: {
      type: 'ObjectId',
      ref: 'user' ,
      required: true,
    },
    placeId: {
      type: 'ObjectId',
      ref: 'place' ,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PosStatusEnum),
      default: PosStatusEnum.PENDING,
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
