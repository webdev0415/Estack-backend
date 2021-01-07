import { ApiProperty } from '@nestjs/swagger';
import { PublicUserDto } from '../../users/dto/public-user.dto';
import { MerchantDbDto } from './merchant-db.dto';
import { SubscriptionDbDto } from '../../subscription/dto/subscription-db.dto';
import { BusinessDbDto } from '../../business/dto/business-db.dto';
import { LoyaltyProgramDbDto } from '../../loyalty-program/dto/loyalty-program-db.dto';
import { LoyaltyTierDbDto } from '../../loyalty-tier/dto/loyalty-tier-db.dto';
import { PointCurrencyDbDto } from '../../point-currency/dto/point-currency-db.dto';
import { PlaceDbDto } from '../../place/dto/place-db.dto';
import { PosDbDto } from '../../pos/dto/pos-db.dto';
import { FileDbDto } from '../../filel/dto/file-db.dto';

/** public merchant that contains no sensitive information */
export class PublicMerchantDto {
  @ApiProperty()
  user: PublicUserDto;
  @ApiProperty()
  merchant: MerchantDbDto;
  @ApiProperty()
  business: BusinessDbDto;
  @ApiProperty()
  subscription: SubscriptionDbDto;
  @ApiProperty()
  loyaltyProgram: LoyaltyProgramDbDto;
  @ApiProperty()
  loyaltyTiers: LoyaltyTierDbDto[];
  @ApiProperty()
  pointCurrency: PointCurrencyDbDto;
  @ApiProperty()
  places: PlaceDbDto[];
  @ApiProperty()
  poses: PosDbDto[];
  @ApiProperty()
  image?: FileDbDto;
}
