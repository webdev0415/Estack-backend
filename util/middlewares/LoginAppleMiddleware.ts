import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../../src/auth/auth.service';

/** lodash */
const _ = require('lodash');

interface GoogleReq extends Request {
  appleUser: {email: string, id: string};
}

@Injectable()
export class LoginAppleMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: GoogleReq, res: Response, next: () => void) {
    const appleUser = await this.authService.getAppleCreeds(_.get(req, 'body.token'));

    req.appleUser = appleUser;
    req.user = await this.authService.validateAppleUser(appleUser.email, appleUser.email);
    next();
  }
}
