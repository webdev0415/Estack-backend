import config from '../config';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { HealthcheckController } from './healthcheck.controller';
import { MorganMiddleware } from '@nest-middlewares/morgan';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CryptoService } from '../util/crypto/crypto/crypto.service';
import { MerchantModule } from './merchant/merchant.module';
import { CustomerModule } from './customer/customer.module';
import { BusinessModule } from './business/business.module';
import { PosModule } from './pos/pos.module';
import { PlaceModule } from './place/place.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ValidateAccessToken } from '../util/middlewares/ValidateAccessToken';
import { LoyaltyTierModule } from './loyalty-tier/loyalty-tier.module';
import { CustomerTierModule } from './customer-tier/customer-tier.module';
import { LoyaltyProgramModule } from './loyalty-program/loyalty-program.module';
import { WalletModule } from './wallet/wallet.module';
import { WalletTransactionsModule } from './wallet-transactions/wallet-transactions.module';
import { WalletTransactionsLogsModule } from './wallet-transactions-logs/wallet-transactions-logs.module';
import { CouponModule } from './coupon/coupon.module';
import { PointCurrencyModule } from './point-currency/point-currency.module';
import { CountersModule } from './counters/counters.module';

/* AppModule
  entrypoint moddule
  initalises morgan logging
  for all app routes
 */
@Module({
  imports: [
    MongooseModule.forRoot(config.mongo_url, config.mongo_options),
    AuthModule,
    UsersModule,
    MerchantModule,
    PosModule,
    CustomerModule,
    BusinessModule,
    PlaceModule,
    SubscriptionModule,
    LoyaltyTierModule,
    CustomerTierModule,
    LoyaltyProgramModule,
    WalletModule,
    WalletTransactionsModule,
    WalletTransactionsLogsModule,
    CouponModule,
    PointCurrencyModule,
    CountersModule,
  ],
  controllers: [HealthcheckController],
  providers: [CryptoService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    MorganMiddleware.configure(config.morganFormat);
    consumer
    .apply(MorganMiddleware)
    .forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
    consumer
    .apply(ValidateAccessToken)
    .forRoutes('*/service*');
  }
}
