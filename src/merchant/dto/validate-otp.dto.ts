import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

}
