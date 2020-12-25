import { ApiProperty } from '@nestjs/swagger';
import { BusinessDbDto } from '../../business/dto/business-db.dto';
import { LoyaltyTierDbDto } from '../../loyalty-tier/dto/loyalty-tier-db.dto';

export class UserBusinessesDto {
  @ApiProperty()
    // tslint:disable-next-line:variable-name
  _id: string;
  @ApiProperty()
  tierId: string;
  @ApiProperty()
  customerId: string;
  @ApiProperty()
  businessId: string;
  @ApiProperty()
  business: BusinessDbDto;
  @ApiProperty()
  loyaltyTier: LoyaltyTierDbDto;
}
