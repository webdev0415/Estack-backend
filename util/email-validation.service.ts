import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { getRandom4Numbers, sendEmail } from './globals';
import redis from './redis';
import config from '../config';

@Injectable()
export class EmailValidationService {
  private codePattern = 'verificationCode';

  private getCodePattern(email): string {
    return `${this.codePattern}::${email}`;
  }

  async sendCode(email: string): Promise<void> {

    const pass = getRandom4Numbers();
    redis.setAsync(
      this.getCodePattern(email),
      pass,
      'EX',
      config.emailVerificationCodeExpireSec,
    );

    return sendEmail(email, 'Email verification', pass);
  }

  async validateCode(email, code): Promise<boolean> {
    const dbCode = await redis.getAsync(this.getCodePattern(email));
    redis.delAsync(this.getCodePattern(email));

    return _.toString(code) === _.toString(dbCode);
  }
}
