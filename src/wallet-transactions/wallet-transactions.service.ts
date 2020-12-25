import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WalletTransactionsDbDto } from './dto/wallet-transactions-db.dto';
import { Model } from 'mongoose';
import { DbModel } from '../../util/modelWrapper';
import { WalletTransactionsLogsService } from '../wallet-transactions-logs/wallet-transactions-logs.service';
import { WalletTransactionsTypeEnum } from './enum/wallet-transactions-type.enum';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';

@Injectable()
export class WalletTransactionsService {
  constructor(
    @InjectModel('WalletTransactions') private readonly walletTransactionsModel: Model<WalletTransactionsDbDto>,
    private readonly walletTransactionsLogsService: WalletTransactionsLogsService,
  ) {
  }

  readonly model = new DbModel(this.walletTransactionsModel);

  getByQuery(query): Promise<WalletTransactionsDbDto> {
    return this.model.findRow({ query });
  }

  async create({
                 type,
                 walletId,
                 customerId,
                 currency,
                 cost,
                 text,
                 posId,
                 businessId,
                 currencyAmount,
               }: CreateWalletTransactionDto): Promise<WalletTransactionsDbDto> {
    const transaction = await this.model.insertRow({
      data: { walletId, cost, type, posId },
    });

    const logCost = type === WalletTransactionsTypeEnum.POINTS_CONVERTED || type === WalletTransactionsTypeEnum.COUPON_ACCEPTED ?
      `-${cost}` : `${cost}`;

    this.walletTransactionsLogsService.create({
      customerId,
      posId,
      transactionId: transaction._id,
      text,
      cost: logCost,
      currency,
      businessId,
      type,
      currencyAmount,
    });
    return transaction;
  }
}
