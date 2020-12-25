import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyTierController } from './loyalty-tier.controller';

describe('LoyaltyTier Controller', () => {
  let controller: LoyaltyTierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoyaltyTierController],
    }).compile();

    controller = module.get<LoyaltyTierController>(LoyaltyTierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
