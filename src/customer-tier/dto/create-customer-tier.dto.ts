import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerTierDto {
  @ApiProperty()
  tierId: string;
  @ApiProperty()
  customerId: string;
  @ApiProperty()
  businessId: string;
}
