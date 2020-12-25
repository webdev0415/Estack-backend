/** CustomerTier that was returned from db and contains sensitive information */
import { ApiProperty } from '@nestjs/swagger';
import { CustomerTierDbDto } from './customer-tier-db.dto';
import { PublicBusinessDto } from '../../business/dto/public-business.dto';

export class CustomerTierPublicDto {
  @ApiProperty()
  customerTier: CustomerTierDbDto;
  @ApiProperty()
  business: PublicBusinessDto;
}
