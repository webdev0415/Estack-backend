import { ApiProperty } from '@nestjs/swagger';

import { PublicUserDto } from '../../users/dto/public-user.dto';

/** login response */
export class LoginResponseDto {
  /** access jwt token */
  @ApiProperty({
    format: 'string',
  })
  accessToken: string;

  /** refresh jwt token */
  @ApiProperty({
    format: 'string',
  })
  refreshToken: string;

  /** user data */
  @ApiProperty({
    format: 'object',
  })
  user: PublicUserDto;
}
