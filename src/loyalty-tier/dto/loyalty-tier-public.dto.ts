import { ApiProperty } from '@nestjs/swagger';

export class LoyaltyTierPublicDto {
  @ApiProperty()
  loyaltyProgramId: string;
  @ApiProperty()
  tierName: string;
  @ApiProperty()
  tierLevel: number;
  @ApiProperty()
  multiplier: number;
  @ApiProperty()
  spendThreshold: number;
  @ApiProperty()
  pointThreshold: number;
  @ApiProperty()
  isActive: boolean;
}
