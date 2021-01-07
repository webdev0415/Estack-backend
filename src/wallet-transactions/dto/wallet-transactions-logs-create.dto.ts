import { CurrencyEnum } from '../../../util/globals/enums/currency.enum';
import { WalletTransactionsTypeEnum } from '../enum/wallet-transactions-type.enum';

export class WalletTransactionsLogsCreateDto {
  customerId: string;
  posId: string;
  businessId?: string;
  transactionId: string;
  text: string;
  cost: string;
  currency: CurrencyEnum;
  type: WalletTransactionsTypeEnum;
  currencyAmount: number;
}
