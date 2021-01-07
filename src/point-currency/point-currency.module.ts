import { Module } from '@nestjs/common';
import { PointCurrencyService } from './point-currency.service';
import { PointCurrencyController } from './point-currency.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PointCurrencySchema } from './point-currency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'PointCurrency', schema: PointCurrencySchema }]),
  ],
  providers: [PointCurrencyService],
  controllers: [PointCurrencyController],
  exports: [PointCurrencyService],
})
export class PointCurrencyModule {
}
