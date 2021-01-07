import { Injectable } from '@nestjs/common';
/** generates salt */
const keygen = require('keygen');
/** encrypts password */
const pbkdf2 = require('pbkdf2');

/** hashed password interface */
interface HashedPassword {
  /** salt */
  salt: string;
  /** hash result */
  password: string;
}

/** CryptoService - hash and salt passwords */
@Injectable()
export class CryptoService {
  /** hash password with new salt
   * @param {string} password - password
   * @returns {HashedPassword} - object that contains salt and hashed password
   */
  hashPassword(password): HashedPassword {
    const salt = this.keyGen(16);
    return {
      salt,
      password: this.saltPassword(salt, password),
    };
  }

  /** has password with salt
   * @param {string} salt - salt
   * @param {string} password - password
   * @returns {string}
   */
  saltPassword(salt, password): string {
    return pbkdf2
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('base64');
  }

  keyGen(n): string {
    return keygen.url(n);
  }
}
