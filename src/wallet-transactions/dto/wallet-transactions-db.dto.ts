import { WalletTransactionsTypeEnum } from '../enum/wallet-transactions-type.enum';
import { Document } from 'mongoose';

export interface WalletTransactionsDbDto extends Document {
  _id: string;
  walletId: string;
  cost: number;
  type: WalletTransactionsTypeEnum;
  createdAt: string;
  updatedAt: string;
}
