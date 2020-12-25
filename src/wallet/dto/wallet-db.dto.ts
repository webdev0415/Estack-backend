import { Document } from 'mongoose';

export interface WalletDbDto extends Document {
  _id: string;
  customerTierId: string;
}
