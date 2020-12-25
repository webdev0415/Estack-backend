import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { CreateUserDto } from '../src/users/dto/createUser.dto';
import { ValidationPipe } from '@nestjs/common';

describe('Auth (e2e)', () => {
  let app;
  let userService: UsersService;
  let createdUserId: string;

  const testUser: CreateUserDto = {
    email: 'test@user.ts',
    password: 'testtest',
    firstName: 'Test',
    lastName: 'User',
    desc: 'test desc',
    roles: ['staff'],
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    userService = moduleFixture.get<UsersService>(UsersService);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      const user = await userService.create(
        JSON.parse(JSON.stringify(testUser)),
      );
      createdUserId = user._id;
    });

    afterEach(async () => {
      await userService.deleteById(createdUserId);
    });

    describe('Error', () => {
      it('fails if body empty', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({})
          .expect(401);
      });

      it('fails if required props missing', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'qwe@qwe.qwe',
          })
          .expect(401);
      });

      it('it fails if user not found', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'notfound@email.com',
            password: testUser.password,
          })
          .expect(404);
      });

      it('it fails if password wrong', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });

    describe('Success', () => {
      it('authenticates user', () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(201);
      });
    });
  });
});
