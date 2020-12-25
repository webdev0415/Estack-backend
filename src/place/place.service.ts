import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../util/modelWrapper';
import { Model } from 'mongoose';
import { PlaceDbDto } from './dto/place-db.dto';
import { CreatePlaceDto } from './dto/create-place.dto';

/**
 * Place Service
 */
@Injectable()
export class PlaceService {
  /**
   * PlaceService
   * @param placeModel
   */
  constructor(
    @InjectModel('Place') private readonly placeModel: Model<PlaceDbDto>,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.placeModel);

  /**
   * create func - creates row in Place model
   * @param {CreatePlaceDto} data
   * @returns {Promise<PlaceDbDto>}
   */
  create(data: CreatePlaceDto): Promise<PlaceDbDto> {
    return this.model.insertRow({ data });
  }

  /**
   * get by id func - returns row from model
   * @param {string} id
   * @returns {Promise<PlaceDbDto>}
   */
  getById(id: string): Promise<PlaceDbDto> {
    return this.model.findById({ id });
  }

  update(id, data: Partial<CreatePlaceDto>): Promise<PlaceDbDto> {
    return this.model.updateRow({ query: { _id: id }, data: _.omit(data, 'businessId') });
  }

  async findNear(businessId, coords): Promise<PlaceDbDto> {
    return this.model.findRow({
      query: {
        $and: [
          {
            businessId,
          },
          {
            location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: coords,
                },
                $maxDistance: 100,
              },
            },
          },
        ],
      },
    });
  }
}
