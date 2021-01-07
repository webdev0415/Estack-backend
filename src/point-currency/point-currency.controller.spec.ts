import { Test, TestingModule } from '@nestjs/testing';
import { PointCurrencyController } from './point-currency.controller';

describe('PointCurrency Controller', () => {
  let controller: PointCurrencyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointCurrencyController],
    }).compile();

    controller = module.get<PointCurrencyController>(PointCurrencyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
