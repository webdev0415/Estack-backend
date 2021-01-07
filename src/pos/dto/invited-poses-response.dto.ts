import { ApiProperty } from '@nestjs/swagger';

/** response to frontend after invitation process */
export class InvitedPosesResponseDto {
  /** emails that were invited */
  @ApiProperty()
  invitedPoses: [string];
  /** emails that were not invited */
  @ApiProperty()
  failedInvitation: [string];
}
