import redis from '../../util/redis';
import config from '../../config';
import * as passGenerator from 'generate-password';
import {
  BadRequestException, ConflictException,
  ForbiddenException,
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CryptoService } from '../../util/crypto/crypto/crypto.service';
import { PublicUserDto } from '../users/dto/public-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { SubscriptionService } from '../subscription/subscription.service';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { generatePassForMob, getRandom4Numbers, refreshTokenMack, refreshTokenPattern, sendEmail } from '../../util/globals';
import { UserTokenDataDto } from './dto/user-token-data.dto';
import { DbUserDto } from '../users/dto/db-user.dto';
import { getResetPasswordPage } from '../../util/htmlPages/getResetPasswordPage';
import { RolesEnum } from '../users/enums/roles.enum';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailValidationService } from '../../util/email-validation.service';

/** lodash */
const _ = require('lodash');

/** authentication service */
@Injectable()
export class AuthService {
  /**
   * CryptoService
   * @param {UsersService} usersService - inject
   * @param {SubscriptionService} subscriptionService - inject
   * @param {JwtService} jwtService - inject
   * @param {CryptoService} cryptoService - inject
   * @param {EmailValidationService} emailValidationService - inject
   * @param httpService
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionService: SubscriptionService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly emailValidationService: EmailValidationService,
    private httpService: HttpService,
  ) {
  }

  private readonly accessTokenSignOptions = { expiresIn: `${config.jwtExpire.accessTokenSec}s` };
  private readonly refreshTokenSignOptions = { expiresIn: `${config.jwtExpire.refreshTokenSec}s` };

  decodeAccessToken(token: string) {
    const payload = this.jwtService.decode(token);
    if (!payload) {
      throw new Error('token invalid');
    }
    const date = new Date().getTime();
    if (date / 1000 > _.get(payload, 'exp')) {
      throw new UnauthorizedException();
    }
    return payload;
  }

  /**
   * validateUser funct - finds user in db by email and compares password
   * @param {string} email - user email
   * @param {string} password - user password
   * @returns {Promise<PublicUserDto>} - valid user
   */
  async validateUser(email: string, password: string): Promise<DbUserDto> {
    const user = await this.usersService.getByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (
      user.password === this.cryptoService.saltPassword(user.salt, password)
    ) {
      return user;
    }

    throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
  }

  async validateGoogleUser(email: string, googleId: string): Promise<DbUserDto> {
    const user = await this.usersService.getByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.auth.googleId === googleId) {
      return user;
    }

    throw new HttpException('Incorrect credentials', HttpStatus.CONFLICT);
  }

  async genTokens(payload: UserTokenDataDto) {

    const refreshToken = this.jwtService.sign(payload, this.refreshTokenSignOptions);

    await redis.setAsync([refreshTokenPattern(payload._id, refreshToken), JSON.stringify(payload), 'EX', config.jwtExpire.refreshTokenSec]);

    return {
      accessToken: this.jwtService.sign(payload, this.accessTokenSignOptions),
      refreshToken,
    };
  }

  /**
   * login func - generates JWT access token
   * @param {PublicUserDto} user - user data
   * @returns {Promise<LoginResponseDto>} - token and user data
   */
  async login(user: DbUserDto): Promise<LoginResponseDto> {
    return {
      user: this.usersService.returnPublicUser(user),
      ...await this.genTokens(_.pick(user, ['roles', '_id'])),
    };
  }

  /**
   * login func - generates JWT access token
   * @param {PublicUserDto} user - user data
   * @returns {Promise<LoginResponseDto>} - token and user data
   */
  async loginMerchant(user: DbUserDto): Promise<LoginResponseDto> {

    const subscription = await this.subscriptionService.getByUserId(user._id);

    return {
      user: this.usersService.returnPublicUser(user),
      ...await this.genTokens({ ..._.pick(user, ['roles', '_id']), subscription }),
    };
  }

  /**
   * getById func
   * @param {string} id - user id
   * @returns {Promise<PublicUserDto>} - user
   */
  async self(id: string): Promise<PublicUserDto> {
    const user = await this.usersService.returnPublicUser(await this.usersService.getById(id));
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  /**
   * validateRefreshToken func
   * @param {string} token - refresh token
   * @returns {Promise<any>} - stored data
   */
  async validateRefreshToken(token: string): Promise<any> {
    const keys = await redis.keysAsync(`${refreshTokenMack}*::${token}`);
    const key = _.first(keys);

    if (!key) {
      throw new HttpException('invalid token', HttpStatus.UNAUTHORIZED);
    }

    const tokenData = await redis.getAsync(key);

    if (!tokenData) {
      throw new HttpException('invalid token', HttpStatus.UNAUTHORIZED);
    }

    return JSON.parse(tokenData);
  }

  /**
   * getById func
   * @param  authInfo - refresh token data
   * @returns {Promise<LoginResponseDto>} - token and user data
   */
  async refresh(authInfo): Promise<RefreshResponseDto> {
    const user = await this.usersService.getById(authInfo._id);

    const payload = _.pick(user, ['roles', '_id']);

    return {
      user: this.usersService.returnPublicUser(user),
      accessToken: this.jwtService.sign(payload, this.accessTokenSignOptions),
    };
  }

  /**
   * getById func
   * @param  authInfo - refresh token data
   * @returns {Promise<LoginResponseDto>} - token and user data
   */
  async refreshMerchant(authInfo): Promise<RefreshResponseDto> {
    const user = await this.usersService.getById(authInfo._id);

    const subscription = await this.subscriptionService.getByUserId(user._id);

    const payload = {
      ..._.pick(user, ['roles', '_id']),
      subscription,
    };

    return {
      user: this.usersService.returnPublicUser(user),
      accessToken: this.jwtService.sign(payload, this.accessTokenSignOptions),
    };
  }

  async validResetPassword(userId, oldPassword, password) {
    const user = await this.usersService.getById(userId);
    const userPassword = _.get(user, 'password');
    const isEqualPasswords = _.isEqual(userPassword, this.cryptoService.saltPassword(user.salt, oldPassword));
    if (userPassword && !isEqualPasswords) {
      throw new ForbiddenException();
    }

    const updatedUser = await this.usersService.update(userId, { password: this.cryptoService.saltPassword(user.salt, password) });

    const userTokens = await redis.keysAsync(`${refreshTokenMack}::${userId}`);

    _.forEach(userTokens, (x) => redis.delAsync(x));

    return updatedUser;
  }

  async resetPassword(userId, oldPassword, password) {
    return this.login(await this.validResetPassword(userId, oldPassword, password));
  }

  async resetMerchantPassword(userId, oldPassword, password): Promise<LoginResponseDto> {
    return this.loginMerchant(await this.validResetPassword(userId, oldPassword, password));
  }

  async forgotPassword(
    email,
    passwordOptions: { letters?: boolean } & passGenerator.Options = { length: 10, numbers: true, letters: true },
  ): Promise<boolean> {
    const user = await this.usersService.getByEmail(email);
    if (!_.isEmpty(user)) {
      const password = passwordOptions.letters ? generatePassForMob(passwordOptions) : getRandom4Numbers();
      const passwordData = await this.cryptoService.hashPassword(password);

      await this.usersService.update(user._id, passwordData);

      await sendEmail(email, config.mail.data.resetPassword.subject, getResetPasswordPage(password));
      return true;
    }
    return false;
  }

  async getGoogleCreeds(token): Promise<{ email: string, user_id: string }> {
    try {
      const { data: googleResponse } =
        await this.httpService.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${_.toString(token)}`).toPromise();
      return googleResponse;
    } catch (e) {
      if (e.status === 400) {
        throw new BadRequestException('Google creds is not valid');
      } else {
        throw new BadRequestException('Try it later');
      }
    }
  }

  async getFBCreeds(token): Promise<{ email: string, id: string }> {
    let fbResponse = { email: null, id: null };
    try {
      const { data } = await this.httpService.get(`https://graph.facebook.com/me?fields=email&access_token=${_.toString(token)}`).toPromise();

      fbResponse = data;
    } catch (e) {
      if (e.status === 401) {
        throw new BadRequestException('Face Book creds is not valid');
      } else {
        throw new BadRequestException('Try it later');
      }
    }

    if (_.isNil(fbResponse.email)) {
      throw new NotFoundException('Email not found in your face book account');
    }

    return fbResponse;
  }

  async validateFbUser(email: string, fbId: string): Promise<DbUserDto> {
    const user = await this.usersService.getByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.auth.fbId === fbId) {
      return user;
    }

    throw new HttpException('Incorrect credentials', HttpStatus.UNAUTHORIZED);
  }

  async getCustomerPassword(email): Promise<boolean> {
    const user = await this.usersService.getByEmail(email);

    if (user && _.chain(user).get('roles').includes(RolesEnum.CUSTOMER).value()) {
      return this.forgotPassword(email, { length: 4, letters: false });
    } else {
      throw new UnauthorizedException();
    }
  }

  async validateEmail(body: VerifyEmailDto): Promise<string> {
    const isValid = await this.emailValidationService.validateCode(body.email, body.code);
    if (isValid === false) {
      throw new HttpException({
          code: 4010101,
          message: 'Invalid verification code',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const code = this.cryptoService.keyGen(10);
    await redis.setAsync(`validationCode::${body.email}`, code, 'EX', config.jwtExpire.regCustomerCodeSec);

    return code;
  }

  async getValidationEmailCode(body): Promise<void> {
    const user = await this.usersService.getByEmail(body.email);

    if (user) {
      throw new ConflictException();
    }

    return this.emailValidationService.sendCode(body.email);
  }
}
