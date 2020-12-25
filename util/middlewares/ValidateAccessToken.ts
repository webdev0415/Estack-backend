import * as _ from 'lodash';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/auth/auth.service';

@Injectable()
export class ValidateAccessToken implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}
  /**
   * auth middleware
   * adds user to req
   * and passes to the next handler
   * @param {object} req - request object
   * @param {object} res - response object
   * @param {function} next - callback
   */
  async use(req, res, next: () => void) {
    try {
      const token = req.headers.authorization;
      const accessToken = token.split(' ')[1];
      const payload = this.authService.decodeAccessToken(accessToken);
      req.user = await this.authService.self(_.get(payload, '_id'));
      next();
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
