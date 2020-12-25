import * as _ from 'lodash';
import * as q from 'q';
import * as passGenerator from 'generate-password';
import { S3, SESV2 } from 'aws-sdk';
import { WalletTransactionsTypeEnum } from '../../src/wallet-transactions/enum/wallet-transactions-type.enum';
import config from '../../config';
import { Logger } from '@nestjs/common';

const logger = new Logger('util');

export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const invitePosTokenMask = 'invite::poss';
export const refreshTokenMack = 'token::refresh';
export const accessTokenPattern = (id, token) => `token::access::${id}::${token}`;
export const invitePosTokenPattern = (id, token) => `${invitePosTokenMask}::${id}::${token}`;
export const refreshTokenPattern = (id, token) => `${refreshTokenMack}::${id}::${token}`;

export const getUserWalletStatus = (
  walletTransactions: Array<{ cost: number, type: WalletTransactionsTypeEnum }>,
): { points: number } => {
  let points = 0;

  _.forEach(walletTransactions, ({ cost, type }) => {

    switch (type) {
      case WalletTransactionsTypeEnum.POINTS_EARNED: {
        points += cost;
        break;
      }
      case WalletTransactionsTypeEnum.COUPON_DENIED: {
        points += cost;
        break;
      }
      case WalletTransactionsTypeEnum.POINTS_CONVERTED: {
        points -= cost;
        break;
      }
      default: {
        return;
      }
    }
  });

  return {
    points,
  };
};

export const formula = {
  grandPoints: (currency: number, tierMultiplier: number): number => currency * tierMultiplier,
  createCoupon: (points: number, calcFactor: number): number => points * calcFactor,
  pointsInCurrency: (points: number, calcFactor: number): number => points * calcFactor,
  currencyAmountForGrantWithTierMultiplier: (points: number, tierMultiplier: number): number =>
    points / tierMultiplier,
};

export const sendEmail = async (email, subject, htmlPage): Promise<void> => {

  const sesv2 = new SESV2(config.awsConfig);

  const params: SESV2.Types.SendEmailRequest = {
    FromEmailAddress: config.mail.data.from,
    Destination: {
      ToAddresses: [
        email,
      ],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: htmlPage,
            Charset: 'UTF-8',
          },
        },
      },
    },
  };

  try {
    await sesv2.sendEmail(params).promise();
  } catch (e) {
    console.error(`Letter for ${email} was't not sent because of error:`);
    console.error(e);
  }
};

export const getRandom4Numbers = () => _.toString(Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000);

export const uploadFile = async (key: string, body: Buffer): Promise<any> => {
  const deferred = q.defer();

  const s3 = new S3(config.awsConfig);

  try {
    s3.putObject(
      {
        Bucket: config.awsConfig.bucket,
        Key: key,
        Body: body,
      },
      callback,
    );
  } catch (error) {
    logger.error(`uploadFile error: ${error}`);
  }

  function callback(params: any) {
    deferred.resolve(params);
  }

  return deferred.promise;
};

/* Потому что мобилка попросила чтобы подходило под ее неадекватный паттерн а ему впадлу фиксить у себя */
export const generatePassForMob = (ops: passGenerator.Options) => {
  const pass = passGenerator.generate(ops);
  if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(pass)) {
    generatePassForMob(ops);
  }
  return pass;
};
