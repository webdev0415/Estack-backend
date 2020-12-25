import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessSchema } from './business.schema';
import { FilesModule } from '../filel/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Business', schema: BusinessSchema }]),
    FilesModule,
  ],
  providers: [BusinessService],
  controllers: [BusinessController],
  exports: [BusinessService],
})
export class BusinessModule {}
