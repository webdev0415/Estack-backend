/** CustomerTier that was returned from db and contains sensitive information */
import { ApiProperty } from '@nestjs/swagger';
import { LoyaltyTierDbDto } from '../../loyalty-tier/dto/loyalty-tier-db.dto';
import { CustomerTierDbDto } from './customer-tier-db.dto';

export class CustomerTiersPublicDto {
  @ApiProperty()
  customerTier: CustomerTierDbDto;
  @ApiProperty()
  businessTiers: LoyaltyTierDbDto[];
}
