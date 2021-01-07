import { WalletTransactionsTypeEnum } from '../../wallet-transactions/enum/wallet-transactions-type.enum';

export interface WalletTransactionsCreateDto {
  walletId: string;
  cost: number;
  type: WalletTransactionsTypeEnum;
  posId: string;
}
