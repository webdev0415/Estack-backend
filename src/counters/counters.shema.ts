import * as mongoose from 'mongoose';

/** counters mongoose schema */
export const CountersSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    sequenceValue: {
      type: Number,
      default: 0,
    },
  },
);
