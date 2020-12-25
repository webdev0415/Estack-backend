import { CurrencyEnum } from '../../../util/globals/enums/currency.enum';
import { WalletTransactionsTypeEnum } from '../../wallet-transactions/enum/wallet-transactions-type.enum';
import { Document } from 'mongoose';

export interface WalletTransactionsLogsDbDto extends Document {
  _id: string;
  id: string;
  customerId: string;
  transaction: string;
  cost: number;
  currency: CurrencyEnum;
  type: WalletTransactionsTypeEnum;
  createdAt: string;
  updatedAt: string;
}
