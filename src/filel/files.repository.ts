import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../util/modelWrapper';
import { Model } from 'mongoose';
import { FileDbDto } from './dto/file-db.dto';
import { CreateFileDto } from './dto/create-file.dto';

/**
 * FileService
 */
@Injectable()
export class FilesRepository {
  /**
   * FileRepository
   * @param fileDbDtoModel
   */
  constructor(
    @InjectModel('Files') private readonly fileDbDtoModel: Model<FileDbDto>,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.fileDbDtoModel);

  create(data: CreateFileDto): Promise<FileDbDto> {
    return this.model.insertRow({ data });
  }

  getById(id): Promise<FileDbDto> {
    return this.model.findById(id);
  }
}
