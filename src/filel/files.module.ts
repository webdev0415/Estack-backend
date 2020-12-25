import { Module } from '@nestjs/common';
import { FilesRepository } from './files.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesSchema } from './files.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Files', schema: FilesSchema }]),
  ],
  providers: [FilesRepository],
  exports: [FilesRepository],
})
export class FilesModule {}
