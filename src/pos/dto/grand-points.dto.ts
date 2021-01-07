import { IsNumber } from 'class-validator';

export class GrandPointsDto {
  @IsNumber()
  currencyAmount: number;
}
