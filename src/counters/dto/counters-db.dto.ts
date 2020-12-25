import { Document } from 'mongoose';

export interface CountersDbDto extends Document {
  _id: string;
  sequenceValue: number;
  __v: number;
}
