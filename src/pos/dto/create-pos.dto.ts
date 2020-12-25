import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** input for create merchant endpoint */
export class CreatePosDto {

  /** token */
  @ApiProperty({
    description: 'Token',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  /** password */
  @ApiProperty({
    description: 'Password',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
