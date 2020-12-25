import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletTransactionsSchema } from './wallet-transactions.schema';
import { WalletTransactionsService } from './wallet-transactions.service';
import { WalletTransactionsLogsModule } from '../wallet-transactions-logs/wallet-transactions-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'WalletTransactions', schema: WalletTransactionsSchema }]),
    WalletTransactionsLogsModule,
  ],
  providers: [WalletTransactionsService],
  exports: [WalletTransactionsService],
})
export class WalletTransactionsModule {
}
