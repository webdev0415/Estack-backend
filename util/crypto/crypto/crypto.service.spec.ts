import { Test, TestingModule } from '@nestjs/testing';

import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('success', () => {
    const PSSWRD = 'qwerty';
    const SAMPLE_PASS = 'qwerty';
    const SAMPLE_SALT = 'qwerty';
    const SAMPLE_HASHED =
      '8ydGbsQyfZufWA/lCdUio7nKbddAmaOXhFMMhE22mAD4g8YH9nRiFe8QMiEXqEVJ295OnJIWX8vSH72f8PUHYQ==';

    it('hashPassword should return salt and password', () => {
      expect(service.hashPassword(PSSWRD)).toHaveProperty('salt');
      expect(service.hashPassword(PSSWRD)).toHaveProperty('password');
    });

    it('saltPassword should return a valid hash string', () => {
      expect(service.saltPassword(SAMPLE_SALT, SAMPLE_PASS)).toBe(
        SAMPLE_HASHED,
      );
    });
  });
});
