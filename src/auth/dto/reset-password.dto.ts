import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'oldPassword',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
  @ApiProperty({
    description: 'password',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
