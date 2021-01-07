import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../util/modelWrapper';
import { Model, Types } from 'mongoose';
import { LoyaltyProgramDbDto } from './dto/loyalty-program-db.dto';
import { CreateLoyaltyProgramDto } from './dto/create-loyalty-program.dto';

/**
 * Place Service
 */
@Injectable()
export class LoyaltyProgramService {
  /**
   * LoyaltyProgramService
   * @param loyaltyProgramModel
   */
  constructor(
    @InjectModel('LoyaltyProgram') private readonly loyaltyProgramModel: Model<LoyaltyProgramDbDto>,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.loyaltyProgramModel);

  /**
   * create func - creates row in Loyalty Program model
   * @param {CreateLoyaltyProgramDto} data
   * @returns {Promise<LoyaltyProgramDbDto>}
   */
  create(data: CreateLoyaltyProgramDto): Promise<LoyaltyProgramDbDto> {
    return this.model.insertRow({ data });
  }

  update(loyaltyProgramId, data: Partial<LoyaltyProgramDbDto>): Promise<LoyaltyProgramDbDto> {
    return this.model.updateRow({ query: { _id: Types.ObjectId(loyaltyProgramId) }, data });
  }
}
