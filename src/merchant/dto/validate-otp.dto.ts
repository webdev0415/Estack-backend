import { IsEmail, IsNotEmpty, IsString, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// import { CreateOtpMerchantDto } from './create-otp-merchant.dto';
// import { Type } from 'class-transformer';
import { PaymentCycleEnum } from '../../subscription/enum/paymentCycle.enum';

/** input for validate Otp endpoint */
export class ValidateOtpDto {
  /** email */
  @ApiProperty({
    description: 'Email',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /** otp */
  @ApiProperty({
    description: 'Code',
    required: true,
    format: 'string',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Plan Type',
    required: true,
    format: 'string',
  })
  @IsNotEmpty()
  @IsString()
  planType: string;

  @ApiProperty({
    description: 'Brand Name',
    required: true,
    format: 'string',
  })
  @IsNotEmpty()
    @IsString()
    brandName: string;
    /** paymentCycle */
  @ApiProperty({
    description: 'Payment cycle',
    required: true,
    format: 'string',
  })
  @IsIn(Object.values(PaymentCycleEnum))
  paymentCycle: string;

    /** quantityOfPos */
  @ApiProperty({
    description: 'quantity Of Pos',
    required: true,
    format: 'string',
  })
  @IsNotEmpty()
  @IsNumber()
  quantityOfPos: number;

}
