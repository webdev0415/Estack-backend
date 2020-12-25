export interface CreateLoyaltyTierDto {
  loyaltyProgramId: string;
  tierName: string;
  tierLevel: number;
  multiplier: number;
  spendThreshold: number;
  pointThreshold: number;
  isActive: boolean;
}
