import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerSocialDto {
  @ApiProperty({
    description: 'Full Name',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;
}
