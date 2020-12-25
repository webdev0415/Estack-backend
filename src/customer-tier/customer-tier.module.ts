import { Module } from '@nestjs/common';
import { CustomerTierController } from './customer-tier.controller';
import { CustomerTierService } from './customer-tier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerTierSchema } from './customer-tier.schema';
import { LoyaltyTierModule } from '../loyalty-tier/loyalty-tier.module';
import { CustomerModule } from '../customer/customer.module';
import { BusinessModule } from '../business/business.module';
import { WalletModule } from '../wallet/wallet.module';
import { WalletTransactionsLogsModule } from '../wallet-transactions-logs/wallet-transactions-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'CustomerTier', schema: CustomerTierSchema }]),
    CustomerModule,
    CustomerTierModule,
    LoyaltyTierModule,
    BusinessModule,
    WalletModule,
    WalletTransactionsLogsModule,
  ],
  controllers: [CustomerTierController],
  providers: [CustomerTierService],
  exports: [CustomerTierService],
})
export class CustomerTierModule {}
