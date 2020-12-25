import { ApiProperty } from '@nestjs/swagger';
import { BusinessDto } from './business.dto';
import { LoyaltyProgramDbDto } from '../../loyalty-program/dto/loyalty-program-db.dto';
import { LoyaltyTierDbDto } from '../../loyalty-tier/dto/loyalty-tier-db.dto';
import { PointCurrencyDbDto } from '../../point-currency/dto/point-currency-db.dto';
import { PlaceDbDto } from '../../place/dto/place-db.dto';

export class PublicBusinessDto extends BusinessDto {
  @ApiProperty()
  loyaltyProgram: LoyaltyProgramDbDto;
  @ApiProperty()
  loyaltyTiers: LoyaltyTierDbDto[];
  @ApiProperty()
  pointCurrency: PointCurrencyDbDto;
  @ApiProperty()
  places: PlaceDbDto[];
}
