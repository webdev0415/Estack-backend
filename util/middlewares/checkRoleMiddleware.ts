/** lodash */
import { UnauthorizedException } from '@nestjs/common';

const _ = require('lodash');

export const checkRolesMiddleware = (role) => (req, res, next) => {
  const { user } = req;
  if (!_.chain(user).get('roles').includes(role).value()) {
    throw new UnauthorizedException();
  }
  next();
};
