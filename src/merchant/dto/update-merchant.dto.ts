import { ApiProperty } from '@nestjs/swagger';
import { PublicUserDto } from '../../users/dto/public-user.dto';
import { MerchantDbDto } from './merchant-db.dto';
import { SubscriptionDbDto } from '../../subscription/dto/subscription-db.dto';
import { BusinessDbDto } from '../../business/dto/business-db.dto';

/** public merchant that contains no sensitive information */
export class UpdateMerchantDto {
  @ApiProperty()
  user: PublicUserDto;
  @ApiProperty()
  merchant: Partial<MerchantDbDto>;
  @ApiProperty()
  business: Partial<BusinessDbDto>;
  @ApiProperty()
  subscription: Partial<SubscriptionDbDto>;
}
