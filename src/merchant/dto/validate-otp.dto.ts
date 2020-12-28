import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOtpMerchantDto } from './create-otp-merchant.dto';
import { Type } from 'class-transformer';

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
    description: 'Code',
    required: false,
    type: CreateOtpMerchantDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOtpMerchantDto)
  options: CreateOtpMerchantDto;

}
