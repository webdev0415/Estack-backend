import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Create Otp response endpoint */
export class CreateOtpResponseDto {
  @ApiProperty({
    description: 'Existed',
    required: true,
    format: 'string',
  })
  @IsBoolean()
  @IsNotEmpty()
  existed: boolean;

}
