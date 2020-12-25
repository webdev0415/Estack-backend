import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { WalletTransactionsTypeEnum } from '../../wallet-transactions/enum/wallet-transactions-type.enum';

export class CustomerTransactionsParamsDto {
  @ApiProperty({
    description: 'start',
    required: false,
    format: 'string',
  })
  @IsOptional()
  @IsString()
  start?: string;

  @ApiProperty({
    description: 'end',
    required: false,
    format: 'string',
  })
  @IsOptional()
  @IsString()
  end?: string;

  @ApiProperty({
    description: 'type',
    required: false,
    format: 'string',
  })
  @IsOptional()
  @IsString()
  type?: WalletTransactionsTypeEnum;

}
