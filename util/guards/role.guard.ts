import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleData = this.reflector.get<{roleGuard: string | string[]}>('roleGuardOptions', context.getHandler());
    const { user: roles } = context.switchToHttp().getRequest();

    let haveAccess: boolean;

    if (typeof roleData.roleGuard === 'string') {
      haveAccess = roles.roles.includes(roleData.roleGuard);
    } else if (roleData.roleGuard instanceof Array) {
      haveAccess = roleData.roleGuard.every(e => roles.roles.includes(e));
    }

    return haveAccess;
  }
}
