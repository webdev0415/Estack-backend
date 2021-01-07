import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DbModel } from '../../util/modelWrapper';
import { CryptoService } from '../../util/crypto/crypto/crypto.service';
import { DbUserDto, IAuth } from './dto/db-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

/** lodash */
const _ = require('lodash');

/** user db operations repository */
@Injectable()
export class UsersRepository {
  /**
   * UsersRepository
   * @param {Model<DbUserDto>} userModel - user model inject
   * @param {CryptoService} cryptoService - hash passwords
   */
  constructor(
    @InjectModel('User') private readonly userModel: Model<DbUserDto>,
    private readonly cryptoService: CryptoService,
  ) {}

  /** wrapped model */
  readonly model = new DbModel(this.userModel);

  /**
   * create user
   * @param {CreateUserDto} user - user
   * @returns {Promise<DbUserDto>} - created user
   */
   create(user: CreateUserDto): Promise<DbUserDto> {
    const auth = _.pick(user, ['email', 'googleId', 'fbId', 'appleId']);

    return this.model.insertRow({
      data: _.assignIn(user, {
        ...this.cryptoService.hashPassword(user.password),
        auth,
        hash: this.createHashFromAuth(auth),
      }),
    });
  }

  /**
   * get user by email from db
   * @param {string} email - user email
   * @returns {Promise<DbUserDto>} - user
   */
  getByEmail(email: string): Promise<DbUserDto> {

    return this.model.findRow({
      query: {
        'auth.email': email,
      },
    });
  }

  /**
   * getById command handler
   * @param {string} id - user id
   * @returns {Promise<DbUserDto>}
   */
  async getById(id: string): Promise<DbUserDto> {
    return this.model.findById({ id });
  }

  /**
   * deleteById command handler
   * @param {string} id - user id
   * @returns {Promise<DbUserDto>}
   */
  async deleteById(id: string): Promise<DbUserDto> {
    return this.model.deleteRow({ query: { _id: id } });
  }

  /**
   * exist func
   * @param filter - filter to search
   * @returns {Promise<boolean>}
   */
  exist(filter): Promise<boolean> {
    return this.userModel.exists(filter);
  }

  /**
   * create hash from auth object
   * @param {IAuth} auth
   * @returns string
   */
  private createHashFromAuth(auth: IAuth): string {
    return Buffer.from(JSON.stringify(auth), 'binary').toString('base64');
  }

  /**
   * updates user func
   * @param {string} id
   * @param {Partial<DbUserDto>} data
   * @returns Promise<DbUserDto>
   */
  update(id: string, data: Partial<DbUserDto>): Promise<DbUserDto> {
    return this.model.updateRow({query: {_id: id}, data});
  }
}
