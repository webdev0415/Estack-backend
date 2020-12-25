import { PublicCustomerDto } from '../../customer/dto/public-customer.dto';
import { LoyaltyTierPublicDto } from '../../loyalty-tier/dto/loyalty-tier-public.dto';

export class GrandPointsDataDto {
  user: PublicCustomerDto['user'];
  customer: PublicCustomerDto['customer'];
  tier: LoyaltyTierPublicDto;
}
