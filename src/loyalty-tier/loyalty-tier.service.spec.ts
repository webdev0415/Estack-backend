import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyTierService } from './loyalty-tier.service';

describe('LoyaltyTierService', () => {
  let service: LoyaltyTierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoyaltyTierService],
    }).compile();

    service = module.get<LoyaltyTierService>(LoyaltyTierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
