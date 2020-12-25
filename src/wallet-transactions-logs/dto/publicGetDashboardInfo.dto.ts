import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsIn } from 'class-validator';

/** input for create merchant endpoint */
export class GetPointEarnedTableDto {

  /** date */
  @ApiProperty({
    description: 'Start date',
    required: true,
    format: 'Date',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  /** date */
  @ApiProperty({
    description: 'End date',
    required: true,
    format: 'Date',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  /** type */
  @ApiProperty({
    description: 'Type',
    required: true,
    format: 'string',
  })
  @IsString()
  @IsIn(['POINTS_EARNED', 'POINTS_CONVERTED'])
  @IsNotEmpty()
  type: string;
}
