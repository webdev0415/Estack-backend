import * as _ from 'lodash';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { DbModel } from '../../util/modelWrapper';
import { RolesEnum } from '../users/enums/roles.enum';
import { PublicCustomerDto } from './dto/public-customer.dto';
import { DbUserDto } from '../users/dto/db-user.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerDbDto } from './dto/customer-db.dto';
import { AuthService } from '../auth/auth.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { WalletTransactionsLogsService } from '../wallet-transactions-logs/wallet-transactions-logs.service';
import { WalletTransactionsTypeEnum } from '../wallet-transactions/enum/wallet-transactions-type.enum';
import { WalletTransactionsLogsDbDto } from '../wallet-transactions-logs/dto/wallet-transactions-logs-db.dto';
import { formula, getRandom4Numbers } from '../../util/globals';
import { CountersService } from '../counters/counters.service';
import { CustomerTransactionsParamsDto } from '../coupon/dto/customer-transactions-params.dto';
import * as moment from 'moment';
import { CreateCustomerSocialDto } from './dto/create-customer-social.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { FilesRepository } from '../filel/files.repository';
import redis from '../../util/redis';

@Injectable()
export class CustomerService {

  /**
   * CustomerService
   * @param customerModel
   * @param {UsersService} usersService - inject
   * @param authService
   * @param walletTransactionsLogsService
   * @param seq
   * @param fileRepository
   */
  constructor(
    @InjectModel('Customer') private readonly customerModel: Model<CustomerDbDto>,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly walletTransactionsLogsService: WalletTransactionsLogsService,
    private readonly seq: CountersService,
    private readonly fileRepository: FilesRepository,
  ) {
  }

  /** wrapped model */
  readonly model = new DbModel(this.customerModel);

  async getCustomerDetails(customerId): Promise<PublicCustomerDto> {
    const customer: CustomerDbDto = await this.model.findRow({ query: { _id: Types.ObjectId(customerId) } });

    if (!customer) {
      throw new BadRequestException('customer not found');
    }

    const user = await this.usersService.getById(customer.userId);

    if (!user) {
      throw new BadRequestException('customer not found');
    }

    const image = user.avatarFileId ? await this.fileRepository.getById(user.avatarFileId) : null;

    return {
      user: _.assign(this.usersService.returnPublicUser(user), { image }),
      customer,
    };
  }

  getByUserId(userId) {
    return this.model.findRow({ query: { userId } });
  }

  /**
   * details func
   * @param {string} userId
   * @returns {Promise<PublicCustomerDto>} - found merchant
   */
  async details(userId: string): Promise<PublicCustomerDto> {
    const user: DbUserDto = await this.usersService.getById(userId);
    const image = user.avatarFileId ? await this.fileRepository.getById(user.avatarFileId) : null;

    const customer: CustomerDbDto = await this.model.findRow({ query: { userId } });

    if (!user || !customer) {
      throw new UnauthorizedException();
    }

    return {
      user: {
        ...this.usersService.returnPublicUser(user),
        image,
      },
      customer,
    };
  }

  /**
   * update func
   * @param {string} userId
   * @param customer
   * @returns {Promise<PublicCustomerDto>} - found merchant
   */
  async update(userId: string, customer: Partial<UpdateCustomerDto>): Promise<PublicCustomerDto> {
    const isCustomerExists = this.model.rowExists({ query: { userId } });
    if (!isCustomerExists) {
      throw new NotFoundException();
    }

    const updatedCustomer = await this.model.updateRow({ query: { userId }, data: customer });

    const user: DbUserDto = await this.usersService.getById(userId);

    if (!user || !customer) {
      throw new NotFoundException();
    }

    return {
      user: this.usersService.returnPublicUser(user),
      customer: updatedCustomer,
    };
  }

  getWalletTransactionsLogs(customerId: string, params: CustomerTransactionsParamsDto): Promise<WalletTransactionsLogsDbDto[]> {
    const query = {
      customerId,
      $and: [
        params.start ? { created_at: { $gte: new Date(moment.unix(_.toNumber(params.start)).toISOString()) } } : {},
        params.end ? { created_at: { $lte: new Date(moment.unix(_.toNumber(params.end)).toISOString()) } } : {},
      ],
    };

    if (params.type) {
      _.set(query, 'type', params.type);
    }

    return this.walletTransactionsLogsService.getLogs(query, { created_at: -1 });
  }

  async getWalletData(customerId) {
    const data = await this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(customerId) } },
        {
          $lookup: {
            from: 'customertiers',
            localField: '_id',
            foreignField: 'customerId',
            as: 'customerTiers',
          },
        },
        {
          $project: {
            _id: 0,
            customerTiers: 1,
          },
        },
        { $unwind: '$customerTiers' },
        {
          $lookup: {
            from: 'wallets',
            localField: 'customerTiers._id',
            foreignField: 'customerTierId',
            as: 'wallet',
          },
        },
        { $unwind: '$wallet' },
        {
          $lookup: {
            from: 'wallettransactions',
            let: { walletId: '$wallet._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$walletId', '$$walletId'] },
                      {
                        $or: [
                          { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_EARNED] },
                          { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_CONVERTED] },
                          { $eq: ['$type', WalletTransactionsTypeEnum.COUPON_DENIED] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'walletTransactions',
          },
        },
        {
          $project: {
            _id: 0,
            walletTransactions: 1,
          },
        },
        { $unwind: '$walletTransactions' },
        {
          $lookup: {
            from: 'wallets',
            localField: 'walletTransactions.walletId',
            foreignField: '_id',
            as: 'wallet',
          },
        },
        { $unwind: '$wallet' },
        {
          $lookup: {
            from: 'customertiers',
            localField: 'wallet.customerTierId',
            foreignField: '_id',
            as: 'customerTier',
          },
        },
        { $unwind: '$customerTier' },
        {
          $lookup: {
            from: 'businesses',
            localField: 'customerTier.businessId',
            foreignField: '_id',
            as: 'business',
          },
        },
        { $unwind: '$business' },
        {
          $lookup: {
            from: 'pointcurrencies',
            localField: 'business._id',
            foreignField: 'businessId',
            as: 'pointCurrency',
          },
        },
        { $unwind: '$pointCurrency' },
        {
          $project: {
            '_id': 0,
            'walletTransactions.cost': 1,
            'walletTransactions.type': 1,
            'pointCurrency.calcFactor': 1,
          },
        },
      ],
    });

    let pointsAmount = 0;
    let currencyAmount = 0;

    _.forEach(data, ({ walletTransactions, pointCurrency }) => {
      if (_.get(walletTransactions, 'type') === WalletTransactionsTypeEnum.POINTS_EARNED) {
        pointsAmount += _.get(walletTransactions, 'cost');
        currencyAmount += formula.pointsInCurrency(_.get(walletTransactions, 'cost'), _.get(pointCurrency, 'calcFactor'));
      }

      if (_.get(walletTransactions, 'type') === WalletTransactionsTypeEnum.COUPON_DENIED) {
        pointsAmount += _.get(walletTransactions, 'cost');
        currencyAmount += formula.pointsInCurrency(_.get(walletTransactions, 'cost'), _.get(pointCurrency, 'calcFactor'));
      }

      if (_.get(walletTransactions, 'type') === WalletTransactionsTypeEnum.POINTS_CONVERTED) {
        pointsAmount -= _.get(walletTransactions, 'cost');
        currencyAmount -= formula.pointsInCurrency(_.get(walletTransactions, 'cost'), _.get(pointCurrency, 'calcFactor'));
      }
    });

    return {
      pointsAmount,
      currencyAmount,
    };
  }

  async getTotalWalletData(customerId) {
    const data = await this.model.aggregateRows({
      query: [
        { $match: { _id: Types.ObjectId(customerId) } },
        {
          $lookup: {
            from: 'customertiers',
            localField: '_id',
            foreignField: 'customerId',
            as: 'customerTiers',
          },
        },
        {
          $project: {
            _id: 0,
            customerTiers: 1,
          },
        },
        { $unwind: '$customerTiers' },
        {
          $lookup: {
            from: 'wallets',
            localField: 'customerTiers._id',
            foreignField: 'customerTierId',
            as: 'wallet',
          },
        },
        { $unwind: '$wallet' },
        {
          $lookup: {
            from: 'wallettransactions',
            let: { walletId: '$wallet._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$walletId', '$$walletId'] },
                      {
                        $or: [
                          { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_EARNED] },
                          { $eq: ['$type', WalletTransactionsTypeEnum.POINTS_CONVERTED] },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'walletTransactions',
          },
        },
        {
          $project: {
            '_id': 0,
            'walletTransactions.cost': 1,
            'walletTransactions.type': 1,
          },
        },
        { $unwind: '$walletTransactions' },
      ],
    });

    let earned = 0;
    let spent = 0;

    _.forEach(data, ({ walletTransactions }) => {
      if (_.get(walletTransactions, 'type') === WalletTransactionsTypeEnum.POINTS_EARNED) {
        earned += _.get(walletTransactions, 'cost');
      }

      if (_.get(walletTransactions, 'type') === WalletTransactionsTypeEnum.POINTS_CONVERTED) {
        spent += _.get(walletTransactions, 'cost');
      }
    });

    return {
      earned,
      spent,
    };
  }

  /**
   * create func
   * @param {CreateCustomerDto} user - merchant data
   * @returns {Promise<PublicCustomerDto>} - created merchant
   */
  async create(user: CreateCustomerDto): Promise<PublicCustomerDto> {
    const {
      email,
      fullName,
      code,
    } = user;
    const dbCode = await redis.getAsync(`validationCode::${email}`);

    if (code !== dbCode) {
      throw new UnauthorizedException();
    }
    return this.singUp({ email, fullName });
  }

  async googleSingUp(token: string, { fullName }: CreateCustomerSocialDto): Promise<PublicCustomerDto> {
    const data = await this.authService.getGoogleCreeds(token);
    return this.singUp({ email: data.email, googleId: data.user_id, fullName });
  }

  async fbSingUp(token: string, { fullName }: CreateCustomerSocialDto): Promise<PublicCustomerDto> {
    const data = await this.authService.getFBCreeds(token);
    return this.singUp({ email: data.email, fbId: data.id, fullName });
  }

  async appleSingUp(token: string, { fullName }: CreateCustomerSocialDto): Promise<PublicCustomerDto> {
    const data = await this.authService.getAppleCreeds(token);
    return this.singUp({ email: data.email, appleId: data.id, fullName });
  }

  async singUp(
    { email, fullName, googleId, fbId, appleId }: { email: string, fullName: string, googleId?: string, fbId?: string, appleId?: string },
  ): Promise<PublicCustomerDto> {
    const password = getRandom4Numbers();
    const user: CreateUserDto = {
      email,
      fullName,
      password,
      roles: [RolesEnum.CUSTOMER],
    };

    if (googleId) {
      _.set(user, 'googleId', googleId);
    }

    if (fbId) {
      _.set(user, 'fbId', fbId);
    }

    if (appleId) {
      _.set(user, 'appleId', appleId);
    }

    const localUser: DbUserDto = await this.usersService.create(user);

    const customer: CustomerDbDto = await this.model.insertRow({
      data: {
        userId: _.get(localUser, '_id'),
        id: await this.seq.getNextVal('customer'),
      },
    });

    return {
      user: localUser,
      customer,
      ...await this.authService.genTokens(localUser),
    };
  }
}
