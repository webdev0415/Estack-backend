import { Test, TestingModule } from '@nestjs/testing';
import { MerchantController } from './merchant.controller';

describe('Merchant Controller', () => {
  let controller: MerchantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantController],
    }).compile();

    controller = module.get<MerchantController>(MerchantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
