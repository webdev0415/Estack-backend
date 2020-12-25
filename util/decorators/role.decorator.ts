import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../guards/role.guard';

export function Roles(options: { roleGuard: string | string[] }) {

  const decorators = [
    SetMetadata('roleGuardOptions', options),
    UseGuards(
      RolesGuard,
    ),
  ];

  return applyDecorators(...decorators);
}
