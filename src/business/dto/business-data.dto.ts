import { LoyaltyTierDbDto } from '../../loyalty-tier/dto/loyalty-tier-db.dto';
import { LoyaltyProgramDbDto } from '../../loyalty-program/dto/loyalty-program-db.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PointCurrencyDbDto } from '../../point-currency/dto/point-currency-db.dto';

export class BusinessDataDto {
  @ApiProperty()
    // tslint:disable-next-line:variable-name
  _id: string;
  @ApiProperty()
  brandName: string;
  @ApiProperty()
  county: string;
  @ApiProperty()
  currency: string;
  @ApiProperty()
  imageId: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  businessId: string;
  @ApiProperty()
  loyaltyTiers: LoyaltyTierDbDto[];
  @ApiProperty()
  loyaltyProgram: LoyaltyProgramDbDto;
  @ApiProperty()
  pointCurrency: PointCurrencyDbDto;

}
