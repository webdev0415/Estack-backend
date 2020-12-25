import { IMetadata } from './metadata';

export interface CreateFileDto {
  ref: string;
  originalName: string;
  metadata?: IMetadata;
}
