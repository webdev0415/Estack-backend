import { HttpModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import config from '../../config/index';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { CryptoService } from '../../util/crypto/crypto/crypto.service';
import { AuthController } from './auth.controller';
import { LoginMiddleware } from '../../util/middlewares/LoginMiddleware';
import { RolesEnum } from '../users/enums/roles.enum';
import { checkRolesMiddleware } from '../../util/middlewares/checkRoleMiddleware';
import { SubscriptionModule } from '../subscription/subscription.module';
import { ValidateRefreshToken } from '../../util/middlewares/ValidateRefreshToken';
import { ValidateAccessToken } from '../../util/middlewares/ValidateAccessToken';
import { LoginGoogleMiddleware } from '../../util/middlewares/LoginGoogleMiddleware';
import { LoginFBMiddleware } from '../../util/middlewares/LoginFBMiddleware';
import { EmailValidationService } from '../../util/email-validation.service';
import { LoginAppleMiddleware } from '../../util/middlewares/LoginAppleMiddleware';

/** AuthModule - contains auth logic and passport strategies */
@Module({
  imports: [
    HttpModule,
    UsersModule,
    PassportModule,
    SubscriptionModule,
    JwtModule.register({
      secret: config.jwtSecret,
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, LocalStrategy, CryptoService, EmailValidationService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(LoginMiddleware)
    .forRoutes('auth/login');
    consumer
    .apply(LoginGoogleMiddleware)
    .forRoutes('auth/google/login');
    consumer
    .apply(LoginFBMiddleware)
    .forRoutes('auth/fb/login');
    consumer
    .apply(LoginAppleMiddleware)
    .forRoutes('auth/apple/login');
    consumer
    .apply(ValidateRefreshToken)
    .forRoutes('auth/refresh/*');
    consumer
    .apply(ValidateAccessToken)
    .forRoutes( 'auth/self', 'auth/reset-password/*');
    consumer
    .apply(checkRolesMiddleware(RolesEnum.CUSTOMER))
    .forRoutes('auth/*/customer');
    consumer
    .apply(checkRolesMiddleware(RolesEnum.POS))
    .forRoutes('auth/*/pos');
    consumer
    .apply(checkRolesMiddleware(RolesEnum.MERCHANT))
    .forRoutes('auth/*/merchant');
  }
}
