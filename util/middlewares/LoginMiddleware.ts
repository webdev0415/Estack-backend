import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../../src/auth/auth.service';

/** lodash */
const _ = require('lodash');

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: () => void) {
    req.user = await this.authService.validateUser(_.get(req, 'body.email'), _.get(req, 'body.password'));
    next();
  }
}
