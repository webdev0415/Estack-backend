import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MerchantSchema } from './merhant.schema';
import { SubscriptionModule } from '../subscription/subscription.module';
import { BusinessModule } from '../business/business.module';
import { MerchantController } from './merchant.controller';
import { AuthModule } from '../auth/auth.module';
import { LoyaltyProgramModule } from '../loyalty-program/loyalty-program.module';
import { LoyaltyTierModule } from '../loyalty-tier/loyalty-tier.module';
import { PointCurrencyModule } from '../point-currency/point-currency.module';
import { StripeService } from '../../util/spripe/stripe';
import { FilesModule } from '../filel/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Merchant', schema: MerchantSchema }]),
    UsersModule,
    BusinessModule,
    SubscriptionModule,
    AuthModule,
    LoyaltyProgramModule,
    LoyaltyTierModule,
    PointCurrencyModule,
    FilesModule,
  ],
  providers: [MerchantService, StripeService],
  controllers: [MerchantController],
  exports: [MerchantService],
})
export class MerchantModule {}
