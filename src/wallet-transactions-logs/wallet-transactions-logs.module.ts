import { Module } from '@nestjs/common';
import { WalletTransactionsLogsService } from './wallet-transactions-logs.service';
import { WalletTransactionsLogsSchema } from './wallet-transactions-logs.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CountersModule } from '../counters/counters.module';
import { WalletTransactionsLogsController } from './wallet-transactions-logs.controller';
import { MerchantModule } from 'src/merchant/merchant.module';
import { BusinessModule } from '../business/business.module';
import { CustomerTierSchema } from '../customer-tier/customer-tier.schema';

@Module({
  imports: [
    MerchantModule,
    BusinessModule,
    MongooseModule.forFeature([{ name: 'WalletTransactionsLogs', schema: WalletTransactionsLogsSchema }]),
    MongooseModule.forFeature([{ name: 'CustomerTier', schema: CustomerTierSchema }]),
    CountersModule,
  ],
  providers: [WalletTransactionsLogsService],
  exports: [WalletTransactionsLogsService],
  controllers: [WalletTransactionsLogsController],
})
export class WalletTransactionsLogsModule {
}
