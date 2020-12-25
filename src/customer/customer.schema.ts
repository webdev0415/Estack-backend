import * as mongoose from 'mongoose';

/** customer mongoose schema */
export const CustomerSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    userId: {
      type: 'ObjectId',
      ref: 'User',
      required: true,
    },
    gender: {
      type: String,
      default: null,
    },
    DOB: {
      type: String,
      default: null,
    },
    notificationsOn: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
