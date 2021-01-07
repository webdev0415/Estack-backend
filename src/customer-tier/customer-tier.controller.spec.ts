import { Test, TestingModule } from '@nestjs/testing';
import { CustomerTierController } from './customer-tier.controller';

describe('CustomerTier Controller', () => {
  let controller: CustomerTierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerTierController],
    }).compile();

    controller = module.get<CustomerTierController>(CustomerTierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
