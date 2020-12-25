import { Module } from '@nestjs/common';
import { CountersService } from './counters.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CountersSchema } from './counters.shema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Counters', schema: CountersSchema }]),
  ],
  providers: [CountersService],
  exports: [CountersService],
})
export class CountersModule {}
