import { ApiProperty } from '@nestjs/swagger';
import { FileDbDto } from '../../filel/dto/file-db.dto';

export class BusinessDto {
  @ApiProperty()
    // tslint:disable-next-line:variable-name
  _id: string;
  @ApiProperty()
  merchantId: string;
  @ApiProperty()
  brandName: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  currency: string;
  @ApiProperty()
  imageId: string;
  @ApiProperty()
  image?: FileDbDto;
}
