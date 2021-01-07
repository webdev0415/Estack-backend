import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../../src/auth/auth.service';

/** lodash */
const _ = require('lodash');

@Injectable()
export class ValidateRefreshToken implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: () => void) {
    req.user = await this.authService.validateRefreshToken(_.get(req, 'body.token'));
    next();
  }
}
