import { Test, TestingModule } from '@nestjs/testing';
import { HealthcheckController } from './healthcheck.controller';

describe('HealthcheckController', () => {
  let healthcheckController: HealthcheckController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthcheckController],
    }).compile();

    healthcheckController = app.get<HealthcheckController>(
      HealthcheckController,
    );
  });

  describe('health', () => {
    it('should return "healthy"', () => {
      expect(healthcheckController.getHealth()).toBe('healthy');
    });
  });
});
