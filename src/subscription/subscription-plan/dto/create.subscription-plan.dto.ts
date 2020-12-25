import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SubscriptionPlanTypeEnum } from '../../enum/subscription-plan-type.enum';
import { PaymentCycleEnum } from '../../enum/paymentCycle.enum';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ format: 'string', required: true })
  @IsEnum(SubscriptionPlanTypeEnum)
  @IsString()
  type: string;

  @ApiProperty({ format: 'string', required: true })
  @IsEnum(PaymentCycleEnum)
  @IsString()
  period: string;

  @ApiProperty({ format: 'number', required: true })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}
