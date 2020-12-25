import { ApiProperty } from '@nestjs/swagger';

import { PublicUserDto } from '../../users/dto/public-user.dto';

/** login response */
export class RefreshResponseDto {
  /** access jwt token */
  @ApiProperty({
    format: 'string',
  })
  accessToken: string;

  /** user data */
  @ApiProperty({
    format: 'object',
  })
  user: PublicUserDto;
}
