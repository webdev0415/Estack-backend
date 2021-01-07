import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** input for create pos endpoint */
export class InvitePosesDto {

  /** emails */
  @ApiProperty({
    description: 'Emails of invited Poses',
    required: true,
    format: 'array',
  })
  @IsNotEmpty()
  emails: [string];
}
