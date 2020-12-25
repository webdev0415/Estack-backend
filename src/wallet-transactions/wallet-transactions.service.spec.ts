import { Test, TestingModule } from '@nestjs/testing';
import { WalletTransactionsService } from './wallet.service';

describe('WalletService', () => {
  let service: WalletTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletTransactionsService],
    }).compile();

    service = module.get<WalletTransactionsService>(WalletTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
