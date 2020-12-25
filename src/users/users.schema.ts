import * as mongoose from 'mongoose';
import { RolesEnum } from './enums/roles.enum';

/** user mongoose schema */
export const UsersSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: true,
    },
    auth: {
      email: {
        type: String,
        sparse: true,
        unique: true,
        required: true,
        index: true,
      },
      googleId: {
        type: String,
        sparse: true,
        unique: true,
        index: true,
      },
      fbId: {
        type: String,
        sparse: true,
        unique: true,
        index: true,
      },
    },
    roles: {
      type: [String],
      enum: Object.values(RolesEnum),
      required: true,
    },
    fullName: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    avatarFileId: {
      type: 'ObjectId',
      ref: 'Files',
      required: false,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    salt: {
      type: String,
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
