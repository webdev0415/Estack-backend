import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletTransactionsLogsDbDto } from './dto/wallet-transactions-logs-db.dto';
import { DbModel } from '../../util/modelWrapper';
import { WalletTransactionsLogsCreateDto } from '../wallet-transactions/dto/wallet-transactions-logs-create.dto';
import { CountersService } from '../counters/counters.service';
import { JwtPayload } from '../auth/dto/jwt-payload.dto';
import * as _ from 'lodash';
import { MerchantService } from '../merchant/merchant.service';
import { BusinessService } from '../business/business.service';

import moment = require('moment');
import { CustomerTierDbDto } from 'src/customer-tier/dto/customer-tier-db.dto';
import { GetDashboardDto } from './dto/getDashboardInfo.dto';
import { GetPointEarnedTableDto } from './dto/publicGetDashboardInfo.dto';

@Injectable()
export class WalletTransactionsLogsService {
  constructor(
    @InjectModel('WalletTransactionsLogs') private readonly walletTransactionsLogsModel: Model<WalletTransactionsLogsDbDto>,
    @InjectModel('CustomerTier') private readonly customerTierDbModel: Model<CustomerTierDbDto>,
    private readonly seq: CountersService,
    private readonly merchantService: MerchantService,
    private readonly businessService: BusinessService,
    ) {
  }

  readonly model = new DbModel(this.walletTransactionsLogsModel);

  readonly customerTierModel = new DbModel(this.customerTierDbModel);

  async create(data: WalletTransactionsLogsCreateDto): Promise<WalletTransactionsLogsDbDto> {
    return this.model.insertRow({
      data: {
        ...data,
        id: await this.seq.getNextVal('walletTransactionsLogs'),
      },
    });
  }

  async getDashboardInfoPointEarnedTable(data: GetPointEarnedTableDto, user: JwtPayload): Promise<any> {
    const merch = await this.merchantService.getByUserId(user._id);

    const business = await this.businessService.getByMerchantId(merch._id);

    const response: any = {
      pointsTotal: {},
      earningByPos: {},
    };

    response.pointsTotal = await this.model.aggregateRows({
      query: [
        {
          $match: {
            type: data.type,
            businessId: business._id,
            created_at: {
              $gte: new Date(data.startDate),
              $lte: new Date(data.endDate),
            },
          },
        },
      ],
    });

    response.earningByPos = await this.model.aggregateRows({
      query: [
        {
          $match: {
            type: 'POINTS_EARNED',
            businessId: business._id,
          },
        },
        {
          $group: {
            _id: '$posId',
            totalAmount: { $sum: '$currencyAmount' },
          },
        },
        { $sort : { totalAmount : -1 } },
      ],
    });

    return response;
  }

  async getDashboardInfo(user: JwtPayload): Promise<GetDashboardDto> {
    const merch = await this.merchantService.getByUserId(user._id);

    const business = await this.businessService.getByMerchantId(merch._id);

    const respose: any = {
      totalTransactions: {},
      visits: {},
      members: {},
      grossValue: {},
    };

    const transactions = await this.model.aggregateRows({
      query: [
        {
          $match: {
            type: { $in: ['POINTS_EARNED', 'COUPON_ACCEPTED'] },
            businessId: business._id,
          },
        },
        { $unwind: '$currencyAmount' },
        {
          $group: {
            _id: 0,
            currencyAmountList: { $push: { currencyAmount: '$currencyAmount' } },
          },
        },
        { $unwind: '$currencyAmountList' },
        {
          $group: {
            _id: 0,
            totalAmount: { $sum: '$currencyAmountList.currencyAmount' },
          },
        },
      ],
    });

    try {
      respose.totalTransactions.totalAmount = transactions[0].totalAmount;
    } catch (error) {
      respose.totalTransactions.totalAmount = 0;
    }

    const transactionsToday = await this.model.aggregateRows({
      query: [
        {
          $match: {
            type: { $in: ['POINTS_EARNED', 'COUPON_ACCEPTED'] },
            created_at: { $gte: new Date(moment().startOf('day').toISOString()) },
            businessId: business._id,
          },
        },
        { $unwind: '$currencyAmount' },
        {
          $group: {
            _id: 0,
            currencyAmountList: { $push: { currencyAmount: '$currencyAmount' } },
          },
        },
        { $unwind: '$currencyAmountList' },
        {
          $group: {
            _id: 0,
            totalAmount: { $sum: '$currencyAmountList.currencyAmount' },
          },
        },
      ],
    });

    try {
      respose.totalTransactions.transactionsToday = transactionsToday[0].totalAmount;
    } catch (error) {
      respose.totalTransactions.transactionsToday = 0;
    }

    respose.visits.totalVisits = await this.model.countRows({
      query: {
        type: { $in: ['POINTS_EARNED', 'COUPON_ACCEPTED'] },
        businessId: business._id,
      },
    });

    respose.visits.todayVisits = await this.model.countRows({
      query: {
        type: { $in: ['POINTS_EARNED', 'COUPON_ACCEPTED'] },
        created_at: { $gte: new Date(moment().startOf('day').toISOString()) },
        businessId: business._id,
      },
    });

    respose.members.totalMembers = await this.customerTierModel.countRows({
      query: {
        businessId: business._id,
      },
    });

    const totalGrossValue = await this.model.aggregateRows({
      query: [
        {
          $match: {
            type: { $in: ['POINTS_EARNED'] },
            businessId: business._id,
          },
        },
        { $unwind: '$currencyAmount' },
        {
          $group: {
            _id: 0,
            currencyAmountList: { $push: { currencyAmount: '$currencyAmount' } },
          },
        },
        { $unwind: '$currencyAmountList' },
        {
          $group: {
            _id: 0,
            totalAmount: { $sum: '$currencyAmountList.currencyAmount' },
          },
        },
      ],
    });

    try {
      respose.grossValue.totalAmount = totalGrossValue[0].totalAmount;
    } catch (error) {
      respose.grossValue.totalAmount = 0;
    }

    return respose;
  }

  getLogs(query, sortQuery?): Promise<WalletTransactionsLogsDbDto[]> {
    return this.model.findRows({ query, sortQuery });
  }
}
