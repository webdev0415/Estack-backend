import { ApiProperty } from '@nestjs/swagger';
import { PosDbDto } from './pos-db.dto';
import { PublicUserDto } from '../../users/dto/public-user.dto';
import { PlaceDbDto } from '../../place/dto/place-db.dto';
import { CouponDbDto } from '../../coupon/enum/coupon-db.dto';
import { PublicBusinessDto } from '../../business/dto/public-business.dto';

/** public pos that contains no sensitive information */
export class PublicPosDto {
  /** user */
  @ApiProperty()
  user: PublicUserDto;

  /** pos */
  @ApiProperty()
  pos: PosDbDto;

  /** place */
  @ApiProperty()
  place: PlaceDbDto;

  /** business */
  @ApiProperty()
  business: PublicBusinessDto;

  /** coupons */
  @ApiProperty()
  coupons: CouponDbDto[];

}
