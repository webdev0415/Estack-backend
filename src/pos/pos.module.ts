import { Module } from '@nestjs/common';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { CryptoService } from '../../util/crypto/crypto/crypto.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { PosSchema } from './pos.schema';
import { JwtModule } from '@nestjs/jwt';
import config from '../../config';
import { PlaceModule } from '../place/place.module';
import { BusinessModule } from '../business/business.module';
import { MerchantModule } from '../merchant/merchant.module';
import { AuthModule } from '../auth/auth.module';
import { PointCurrencyModule } from '../point-currency/point-currency.module';
import { WalletTransactionsModule } from '../wallet-transactions/wallet-transactions.module';
import { WalletTransactionsLogsModule } from '../wallet-transactions-logs/wallet-transactions-logs.module';
import { CustomerTierModule } from '../customer-tier/customer-tier.module';
import { CouponModule } from '../coupon/coupon.module';
import { PosValidationService } from './pos-validation.service';
import { CountersModule } from '../counters/counters.module';
import { LoyaltyTierModule } from '../loyalty-tier/loyalty-tier.module';
import { CustomerModule } from '../customer/customer.module';
import { GatewayModule } from '../../util/gateway/gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Pos', schema: PosSchema }]),
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: config.jwtExpire.posInviteSec },
    }),
    AuthModule,
    UsersModule,
    PlaceModule,
    BusinessModule,
    MerchantModule,
    CustomerTierModule,
    PointCurrencyModule,
    WalletTransactionsModule,
    WalletTransactionsLogsModule,
    LoyaltyTierModule,
    CouponModule,
    CountersModule,
    CustomerModule,
    GatewayModule,
  ],
  providers: [PosService, CryptoService, PosValidationService],
  controllers: [PosController],
  exports: [PosService],
})
export class PosModule {
}
