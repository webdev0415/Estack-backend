import { Test, TestingModule } from '@nestjs/testing';
import { WalletTransactionsLogsService } from './wallet-transactions-logs.service';

describe('WalletTransactionsLogsService', () => {
  let service: WalletTransactionsLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletTransactionsLogsService],
    }).compile();

    service = module.get<WalletTransactionsLogsService>(WalletTransactionsLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
