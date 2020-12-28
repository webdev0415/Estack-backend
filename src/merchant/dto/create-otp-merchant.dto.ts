import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMerchantDto } from './create-merchant.dto';

/** input for create otp merchant endpoint */
export class CreateOtpMerchantDto extends CreateMerchantDto {
  /** otp */
  @ApiProperty({
    description: 'Code',
    required: true,
    format: 'string',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
