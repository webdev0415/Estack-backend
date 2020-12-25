import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { BusinessModule } from '../business/business.module';
import { CustomerSchema } from './customer.schema';
import { AuthModule } from '../auth/auth.module';
import { WalletTransactionsLogsModule } from '../wallet-transactions-logs/wallet-transactions-logs.module';
import { CountersModule } from '../counters/counters.module';
import { FilesModule } from '../filel/files.module';
import { EmailValidationService } from '../../util/email-validation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Customer', schema: CustomerSchema }]),
    UsersModule,
    BusinessModule,
    AuthModule,
    WalletTransactionsLogsModule,
    CountersModule,
    FilesModule,
  ],
  providers: [CustomerService, EmailValidationService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
