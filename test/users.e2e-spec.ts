import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/users/dto/createUser.dto';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from '../src/users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('Users (e2e)', () => {
  let app;
  let userService: UsersService;
  let createdUserId: string;
  let jwtService: JwtService;

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
    jwtService = moduleFixture.get<JwtService>(JwtService);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  describe('/users/signup (POST)', () => {
    describe('Error', () => {
      it('fails with empty body', () => {
        return request(app.getHttpServer())
          .post('/users/signup')
          .send()
          .expect(400);
      });

      it('fails with not allowed role', () => {
        return request(app.getHttpServer())
          .post('/users/signup')
          .send({
            email: 'test@user.ts',
            password: 'testtest',
            firstName: 'Test',
            lastName: 'User',
            desc: 'test desc',
            roles: ['staff', 'root'],
          })
          .expect(400);
      });

      it('fails required properties missing', () => {
        return request(app.getHttpServer())
          .post('/users/signup')
          .send({
            firstName: 'Test',
            lastName: 'User',
            desc: 'test desc',
            roles: ['staff'],
          })
          .expect(400);
      });
    });

    describe('Success', () => {
      afterEach(async () => {
        await userService.deleteById(createdUserId);
      });

      it('creates user and responds with 201', async () => {
        const res = await request(app.getHttpServer())
          .post('/users/signup')
          .send(testUser);

        createdUserId = res.body._id;
        expect(res.status).toEqual(201);
      });
    });
  });

  describe('/users/self (GET)', () => {
    describe('Error', () => {
      it('fails with no auth header', () => {
        return request(app.getHttpServer())
          .get('/users/self')
          .expect(401);
      });

      it('fails with invalid token', () => {
        const invalidToken = jwtService.sign({
          _id: '5e032860377b9549ddf5eb10',
          roles: ['user'],
        });
        return request(app.getHttpServer())
          .get('/users/self')
          .set('Authorization', `bearer ${invalidToken}`)
          .expect(404);
      });

      it('fails with invalid id in token', () => {
        const invalidToken = jwtService.sign({
          _id: 'invalid',
          roles: ['user'],
        });
        return request(app.getHttpServer())
          .get('/users/self')
          .set('Authorization', `bearer ${invalidToken}`)
          .expect(500);
      });
    });

    describe('Succes', () => {
      beforeEach(async () => {
        const user = await userService.create(
          JSON.parse(JSON.stringify(testUser)),
        );
        createdUserId = user._id;
      });

      afterEach(async () => {
        await userService.deleteById(createdUserId);
      });

      it('succeeds to find user by token', () => {
        const validToken = jwtService.sign({
          _id: createdUserId,
          roles: ['user'],
        });
        return request(app.getHttpServer())
          .get('/users/self')
          .set('Authorization', `bearer ${validToken}`)
          .expect(200);
      });
    });
  });
});
