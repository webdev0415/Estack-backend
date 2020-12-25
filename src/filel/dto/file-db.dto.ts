import { Document } from 'mongoose';
import { IMetadata } from './metadata';

export interface FileDbDto extends Document {
  /** id */
  _id: string;
  /** ref */
  ref: string;
  /** originalName */
  originalName: string;
  /** metadata */
  metadata?: IMetadata;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
