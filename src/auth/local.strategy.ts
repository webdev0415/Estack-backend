import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { AuthService } from './auth.service';
import { PublicUserDto } from '../users/dto/public-user.dto';

/** passport local strategy - for email and password check */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * LocalStrategy
   * @param {AuthService} authService - inject auth service
   */
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * validate - email and password
   * @param {string} email - user email
   * @param {string} password - user password
   * @returns {Promise<PublicUserDto>} - valid user data
   */
   validate(email: string, password: string): Promise<PublicUserDto> {

    return this.authService.validateUser(email, password);
  }
}
