import * as mongoose from 'mongoose';

/** place mongoose schema */
export const PlaceSchema = new mongoose.Schema(
  {
    businessId: {
      type: 'ObjectId',
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    address2: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    postalCode: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

PlaceSchema.index({ location: '2dsphere' });
