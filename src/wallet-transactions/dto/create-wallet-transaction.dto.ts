import { WalletTransactionsTypeEnum } from '../enum/wallet-transactions-type.enum';
import { CurrencyEnum } from '../../../util/globals/enums/currency.enum';

export interface CreateWalletTransactionDto {
  customerId: string;
  type: WalletTransactionsTypeEnum;
  currency: CurrencyEnum;
  walletId: string;
  cost: number;
  text: string;
  posId?: string;
  businessId?: string;
  currencyAmount?: number;
}
