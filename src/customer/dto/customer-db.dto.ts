import { Document } from 'mongoose';

/** Customer that was returned from db and contains sensitive information */
export interface CustomerDbDto extends Document {
  /** id */
  _id: string;
  /** userId */
  userId: string;
  /** gender */
  gender: string;
  /** DOB */
  DOB: string;
  /** notificationsOn */
  notificationsOn: boolean;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
