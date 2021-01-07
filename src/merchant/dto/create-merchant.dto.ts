import { IsEmail, IsNotEmpty, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentCycleEnum } from '../../subscription/enum/paymentCycle.enum';

/** input for create merchant endpoint */
export class CreateMerchantDto {
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

  /** password */
  @ApiProperty({
    description: 'Password',
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  /** brandName */
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
