import { ApiProperty } from '@nestjs/swagger';
import { RolesEnum } from '../enums/roles.enum';
import { IAuth } from './db-user.dto';
import { FileDbDto } from '../../filel/dto/file-db.dto';

/** public user that contains no sensitive information */
export class PublicUserDto {
  /** id */
  @ApiProperty()
  // tslint:disable-next-line: variable-name
  _id?: string;
  /** roles array */
  @ApiProperty()
  roles: [RolesEnum];
  /** soft delete */
  @ApiProperty()
  isDeleted?: boolean;
  /** auth */
  @ApiProperty()
  auth: IAuth;
  /** f name */
  @ApiProperty()
  fullName: string;
  @ApiProperty()
  image?: FileDbDto;
  /** created */
  @ApiProperty()
  createdAt?: Date;
  /** updated */
  @ApiProperty()
  updatedAt?: Date;
  /** ver */
  @ApiProperty()
  // tslint:disable-next-line: variable-name
  __v?: number;
}
