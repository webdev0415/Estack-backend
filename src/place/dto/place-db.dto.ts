import { Document } from 'mongoose';

/** place that was returned from db and contains sensitive information */
export interface PlaceDbDto extends Document {
  /** id */
  _id: string;
  /** businessId */
  businessId: string;
  /** name */
  name: string;
  /** address */
  address: string;
  /** location */
  location: string;
  /** address2 */
  address2?: string;
  /** city */
  city?: string;
  /** postalCode */
  postalCode?: string;
  /** created */
  createdAt: Date;
  /** updated */
  updatedAt: Date;
  /** version */
  __v: number;
}
