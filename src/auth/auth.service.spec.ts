import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CryptoService } from '../../util/crypto/crypto/crypto.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import config from '../../config/index';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/createUser.dto';
import { PublicUserDto } from '../users/dto/public-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  let testUserId: string;
  let validUser: PublicUserDto;

  const testUser: CreateUserDto = {
    email: 'test@auth.ts',
    password: 'testtest11',
    fullName: 'Test',
    roles: ['staff'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret: config.jwtSecret,
          signOptions: { expiresIn: config.jwtExpire },
        }),
        MongooseModule.forRoot(config.mongo_url, config.mongo_options),
      ],
      providers: [AuthService, LocalStrategy, CryptoService],
      controllers: [AuthController],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('users service should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('success', () => {
    beforeEach(async () => {
      const createdUser = await usersService.create(
        JSON.parse(JSON.stringify(testUser)),
      );
      testUserId = createdUser._id;
    });

    afterEach(async () => {
      await usersService.deleteById(testUserId);
    });

    it('should validate user', async () => {
      validUser = await service.validateUser(testUser.email, testUser.password);
      expect(validUser).toHaveProperty('_id');
    });

    it('should give user access_token', async () => {
      const loginResult = await service.login(validUser);
      expect(loginResult).toHaveProperty('access_token');
    });
  });

  describe('error', () => {
    const invalidEmail = 'invalid@auth.ts';
    const invalidPassword = 'invalid111';

    beforeEach(async () => {
      const createdUser = await usersService.create(
        JSON.parse(JSON.stringify(testUser)),
      );
      testUserId = createdUser._id;
    });

    afterEach(async () => {
      await usersService.deleteById(testUserId);
    });

    it('should throw 404 when unable to find user', async () => {
      expect(
        service.validateUser(invalidEmail, testUser.password),
      ).rejects.toThrow();
    });

    it('should unauth when password invalid', async () => {
      expect(
        service.validateUser(testUser.email, invalidPassword),
      ).rejects.toThrow();
    });
  });
});
