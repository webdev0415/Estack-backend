import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubscriptionDataDto {
  @ApiProperty({ format: 'string', required: true })
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  subscriptionId: string;

  @ApiProperty({ format: 'string', required: true })
  @IsString()
  @IsNotEmpty()
  email: string;
}

// tslint:disable-next-line:max-classes-per-file
export class UpdateSubscriptionDto {
  @ApiProperty({ format: 'string', required: true })
  @IsNotEmpty()
  @IsMongoId()
  @IsString()
  id: string;

  @ApiProperty({ format: 'array', required: true })
  @IsArray()
  created: UpdateSubscriptionDataDto[];

  @ApiProperty({ format: 'array', required: true })
  @IsArray()
  deleted: UpdateSubscriptionDataDto[];
}
