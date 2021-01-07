import { Test, TestingModule } from '@nestjs/testing';
import { PointCurrencyService } from './point-currency.service';

describe('PointCurrencyService', () => {
  let service: PointCurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointCurrencyService],
    }).compile();

    service = module.get<PointCurrencyService>(PointCurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
