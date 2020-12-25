import { Test, TestingModule } from '@nestjs/testing';
import { CustomerTierService } from './customer-tier.service';

describe('CustomerTierService', () => {
  let service: CustomerTierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerTierService],
    }).compile();

    service = module.get<CustomerTierService>(CustomerTierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
