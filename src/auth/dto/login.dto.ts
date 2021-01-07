import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

/** login payload */
export class LoginDto {
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
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
