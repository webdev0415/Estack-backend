/** user that was returned from db and contains sensitive information */
import { RolesEnum } from '../enums/roles.enum';
import { Document } from 'mongoose';

export interface DbUserDto extends Document {
  /** id */
  _id: string;
  /** avatarFileId */
  avatarFileId: string;
  /** roles array */
  roles: [RolesEnum];
  /** soft delete */
  isDeleted: boolean;
  /** auth */
  auth: IAuth;
  /** password */
  password: string;
  /** salt */
  salt: string;
  /** f name */
  fullName: string;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}

export interface IAuth {
  /** email */
  email: string;
  /** googleId */
  googleId: string;
  /** fbId */
  fbId: string;
  /** appleId */
  appleId: string;
}
