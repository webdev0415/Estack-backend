import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class VerifyEmailDto {
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

  /** code */
  @ApiProperty({
    description: 'Verification code',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
