import { Module } from '@nestjs/common';
import { LoyaltyTierService } from './loyalty-tier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyTierSchema } from './loyalty-tier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'LoyaltyTier', schema: LoyaltyTierSchema }]),
  ],
  providers: [LoyaltyTierService],
  exports: [LoyaltyTierService],
})
export class LoyaltyTierModule {}
