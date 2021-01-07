import { IsBoolean, IsIn, IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum } from '../enum/gender.enum';

/** update customer endpoint */
export class UpdateCustomerDto {

  @ApiProperty({
    description: 'Gender',
    format: 'string',
  })
  @IsIn(Object.values(GenderEnum))
  @IsNotEmpty()
  gender: GenderEnum;

  @ApiProperty({
    description: 'Date of birth',
    format: 'number',
  })
  @IsNumberString()
  @IsNotEmpty()
  DOB: string | number;

  @ApiProperty({
    description: 'is notifications on',
    format: 'boolean',
  })
  @IsBoolean()
  @IsNotEmpty()
  notificationsOn: boolean;
}
