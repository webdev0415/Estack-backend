import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from './users.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import config from '../../config/index';

import { UsersRepository } from './users.repository';
import { CryptoService } from '../../util/crypto/crypto/crypto.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { CreateUserDto } from './dto/create-user.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { RolesEnum } from './enums/roles.enum';

const testUser: CreateUserDto = {
  email: 'test@user.ts',
  password: 'testtest',
  fullName: 'Test',
  roles: [RolesEnum.MERCHANT],
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(config.mongo_url, config.mongo_options),
        MongooseModule.forFeature([{ name: 'User', schema: UsersSchema }]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: config.jwtSecret,
          signOptions: { expiresIn: config.jwtExpire },
        }),
      ],
      providers: [UsersService, UsersRepository, CryptoService, JwtStrategy],
      exports: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('success', () => {
    let createdUser: PublicUserDto;

    it('should create user', async () => {
      createdUser = await service.create(testUser);
      expect(createdUser).toHaveProperty('_id');
    });

    it('should find user by email', async () => {
      const userFound = await service.getByEmail(createdUser.auth.email);
      expect(userFound.auth.email).toBe(createdUser.auth.email);
    });

    it('should find user by id', async () => {
      const userFound = await service.getById(createdUser._id);
      expect(userFound.auth.email).toBe(createdUser.auth.email);
    });

    it('should delete user by id', async () => {
      const userDeleted = await service.deleteById(createdUser._id);
      expect(userDeleted.auth.email).toBe(createdUser.auth.email);
    });
  });

  describe('error', () => {
    const invalidUser: CreateUserDto = {
      email: 'test@invalid.ts',
      password: 'testtest',
      fullName: 'Test',
      roles: [RolesEnum.MERCHANT],
    };

    const invalidId = '5df9e459677f01111e111c11';

    it('should return null for invalid email', async () => {
      expect(await service.getByEmail(invalidUser.email)).toBe(null);
    });

    it('throws 404 if user not found by id', async () => {
      expect(service.getById(invalidId)).rejects.toThrow();
    });

    it('throws 404 if user not found by email', async () => {
      expect(service.deleteById(invalidId)).rejects.toThrow();
    });
  });
});
