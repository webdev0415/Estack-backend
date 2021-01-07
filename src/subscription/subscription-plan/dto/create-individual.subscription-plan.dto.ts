import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { CreateSubscriptionPlanDto } from './create.subscription-plan.dto';

export class CreateIndividualSubscriptionPlanDto extends CreateSubscriptionPlanDto {
  @ApiProperty({ format: 'string', required: true })
  @IsEnum(['individual'])
  @IsString()
  type: string;
}
