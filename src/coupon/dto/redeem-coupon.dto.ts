import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RedeemCouponDto {
  /** lat */
  @ApiProperty({
    description: 'lat',
    required: true,
    format: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  /** lng */
  @ApiProperty({
    description: 'lng',
    required: true,
    format: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  lng: number;
}
