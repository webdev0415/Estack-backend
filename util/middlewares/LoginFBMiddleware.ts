import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../../src/auth/auth.service';

/** lodash */
const _ = require('lodash');

interface GoogleReq extends Request {
  fbUser: {email: string, id: string};
}

@Injectable()
export class LoginFBMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: GoogleReq, res: Response, next: () => void) {
    const fbUser = await this.authService.getFBCreeds(_.get(req, 'body.token'));

    req.fbUser = fbUser;
    req.user = await this.authService.validateFbUser(fbUser.email, fbUser.id);
    next();
  }
}
