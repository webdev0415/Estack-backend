import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** input for create customer endpoint */
export class CreateCustomerDto {
  @ApiProperty({
    description: 'Email',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Full Name',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Code',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
