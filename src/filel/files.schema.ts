import * as mongoose from 'mongoose';

export const FilesSchema = new mongoose.Schema(
  {
    ref: {
      type: String,
      default: null,
    },
    originalName: {
      type: String,
      default: null,
    },
    metadata: {
      type: Object,
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
