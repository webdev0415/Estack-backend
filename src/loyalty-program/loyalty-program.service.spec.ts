import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyProgramService } from './loyalty-program.service';

describe('LoyaltyProgramService', () => {
  let service: LoyaltyProgramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoyaltyProgramService],
    }).compile();

    service = module.get<LoyaltyProgramService>(LoyaltyProgramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
