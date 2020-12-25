import { Module } from '@nestjs/common';
import { LoyaltyProgramService } from './loyalty-program.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyProgramSchema } from './loyalty-program.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'LoyaltyProgram', schema: LoyaltyProgramSchema }]),
  ],
  providers: [LoyaltyProgramService],
  exports: [LoyaltyProgramService],
})
export class LoyaltyProgramModule {}
