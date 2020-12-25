import { Document } from 'mongoose';
import { FileDbDto } from '../../filel/dto/file-db.dto';

/** business that was returned from db and contains sensitive information */
export interface BusinessDbDto extends Document {
  /** id */
  _id: string;
  /** brandName */
  brandName: string;
  /** county */
  county: string;
  /** currency */
  currency: string;
  /** imageId */
  imageId: string;
  /** image */
  image?: FileDbDto;
  /** merchantId */
  merchantId: string;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
