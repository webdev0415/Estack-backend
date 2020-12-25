import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  /** cost */
  @ApiProperty({
    description: 'cost',
    required: true,
    format: 'number',
  })
  @IsNumber()
  @IsPositive()
  cost: number;
}
