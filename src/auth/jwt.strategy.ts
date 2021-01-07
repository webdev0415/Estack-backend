import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

import config from '../../config/index';
import { JwtPayload } from './dto/jwt-payload.dto';

/** passport jwt strategy - for token validation */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /** JwtStrategy */
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  /**
   * validate - token and payload structure
   * @param {JwtPayload} payload - payload
   * @returns {Promise<JwtPayload>} - decrypted payload
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload._id || !payload.roles) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return { _id: payload._id, roles: payload.roles };
  }
}
