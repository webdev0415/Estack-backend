import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../../src/auth/auth.service';

/** lodash */
const _ = require('lodash');

interface GoogleReq extends Request {
  googleUser: {email: string, user_id: string};
}

@Injectable()
export class LoginGoogleMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: GoogleReq, res: Response, next: () => void) {
    const googleUser = await this.authService.getGoogleCreeds(_.get(req, 'body.token'));

    req.googleUser = googleUser;
    req.user = await this.authService.validateGoogleUser(googleUser.email, googleUser.user_id);
    next();
  }
}
