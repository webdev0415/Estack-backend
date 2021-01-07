import { Document } from 'mongoose';
import { PosStatusEnum } from '../../merchant/enum/pos-status.enum';

/** pos that was returned from db and contains sensitive information */
export interface PosDbDto extends Document {
  /** id */
  _id: string;
  /** userId */
  userId: string;
  /** placeId */
  placeId: string;
  /** status */
  status: PosStatusEnum;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
