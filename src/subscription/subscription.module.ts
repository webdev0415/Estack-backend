import config from '../../config';
import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionSchema } from './subscription.shema';
import { SubscriptionScheduleRepository } from './subscription-schedule/subscription-schedule.repository';
import { LoyaltyProgramSchema } from '../loyalty-program/loyalty-program.schema';
import { SubscriptionPlanSchema } from './subscription-plan/subscription-plan.schema';
import { SubscriptionPlanService } from './subscription-plan/subscription-plan.service';
import { SubscriptionPlanRepository } from './subscription-plan/subscription-plan.repository';
import { SubscriptionPlanController } from './subscription-plan/subscription-plan.controller';
import { SubscriptionRepository } from './subscription.repository';
import { CronService } from './subscription-schedule/cron.service';
import { BullModule } from '@nestjs/bull';
import { MerchantSchema } from '../merchant/merhant.schema';
import { StripeService } from '../../util/spripe/stripe';
import { CronController } from './subscription-schedule/cron.controller';

const CONTROLLERS = [
  SubscriptionController,
  SubscriptionPlanController,
  CronController,
];

const SERVICES = [
  SubscriptionService,
  SubscriptionPlanService,
  CronService,
  StripeService,
];

const REPOS = [
  SubscriptionScheduleRepository,
  SubscriptionPlanRepository,
  SubscriptionRepository,
];

@Module({
  imports: [
    BullModule.registerQueue(config.cron),
    MongooseModule.forFeature([
      { name: 'LoyaltyProgram', schema: LoyaltyProgramSchema },
      { name: 'Subscription', schema: SubscriptionSchema },
      { name: 'subscriptions.plan', schema: SubscriptionPlanSchema },
      { name: 'Merchant', schema: MerchantSchema }]),
  ],
  controllers: CONTROLLERS,
  providers: [...SERVICES, ...REPOS],
  exports: [...SERVICES, ...REPOS],
})
export class SubscriptionModule {}
