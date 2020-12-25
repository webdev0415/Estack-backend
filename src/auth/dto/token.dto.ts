import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @ApiProperty({
    description: 'token',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
