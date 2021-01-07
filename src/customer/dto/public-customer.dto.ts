import { ApiProperty } from '@nestjs/swagger';
import { PublicUserDto } from '../../users/dto/public-user.dto';
import { CustomerDbDto } from './customer-db.dto';

/** public merchant that contains no sensitive information */
export class PublicCustomerDto {
  @ApiProperty()
  user: PublicUserDto;
  @ApiProperty()
  customer: CustomerDbDto;
}
