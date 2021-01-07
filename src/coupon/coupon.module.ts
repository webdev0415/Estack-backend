import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponSchema } from './coupon.schema';
import { CountersModule } from '../counters/counters.module';
import { CustomerModule } from '../customer/customer.module';
import { BusinessModule } from '../business/business.module';
import { CouponValidationService } from './coupon-validation.service';
import { CustomerTierModule } from '../customer-tier/customer-tier.module';
import { WalletTransactionsModule } from '../wallet-transactions/wallet-transactions.module';
import { PlaceModule } from '../place/place.module';
import { CouponSchedule } from './coupon-schedule/coupon-schedule';
import { CouponScheduleRepository } from './coupon-schedule/coupon-schedule-repository.service';
import { GatewayModule } from '../../util/gateway/gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Coupon', schema: CouponSchema }]),
    CountersModule,
    CustomerModule,
    BusinessModule,
    CustomerTierModule,
    WalletTransactionsModule,
    PlaceModule,
    GatewayModule,
  ],
  providers: [CouponService, CouponValidationService, CouponScheduleRepository],
  controllers: [CouponController],
  exports: [CouponService],
})
export class CouponModule implements OnApplicationBootstrap {
  constructor(
    private readonly couponScheduleRepository: CouponScheduleRepository,
  ) {
  }

  onApplicationBootstrap() {
    const subscriptionSchedule = new  CouponSchedule(this.couponScheduleRepository);
    subscriptionSchedule.run();
  }
}
