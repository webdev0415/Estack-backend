import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WalletDbDto } from './dto/wallet-db.dto';
import { DbModel } from '../../util/modelWrapper';

@Injectable()
export class WalletService {

  constructor(
    @InjectModel('Wallet') private readonly walletModel: Model<WalletDbDto>,
  ) {
  }

  readonly model = new DbModel(this.walletModel);

  create({ customerTierId, businessId }): Promise<WalletDbDto> {
    return this.model.insertRow({ data: { customerTierId, businessId } });
  }
}
