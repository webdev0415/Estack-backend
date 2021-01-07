import { PosDbDto } from './pos-db.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PlaceDbDto } from '../../place/dto/place-db.dto';

export class UpdatePosResponseDto {
  @ApiProperty()
  pos: PosDbDto;

  @ApiProperty()
  place: PlaceDbDto;
}
