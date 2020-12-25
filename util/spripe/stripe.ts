import { Injectable, HttpStatus, HttpException, Logger } from '@nestjs/common';
import config from '../../config';

const Stripe = require('stripe')(config.stripe.secretKey);

export interface CardList {
  object: string;
  data: [CardInterface];
  has_more: boolean;
  url: string;
}

export interface CardInterface {
  id: string;
  object: string;
  address_city?: string;
  address_country?: string;
  address_line1?: string;
  address_line1_check?: string;
  address_line2?: string;
  address_state?: string;
  address_zip?: string;
  address_zip_check?: string;
  brand: string;
  country: string;
  customer: string;
  cvc_check?: string;
  dynamic_last4?: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  last4: number;
  metadata: object;
  name?: string;
  tokenization_method?: string;
}

export interface DeleteCardInterface {
  id: string;
  object: string;
  deleted: boolean;
}

export interface TransactionInterface {
  customer: string;
  source: string;
  amount: number;
  currency: string;
  description?: string;
}

interface ICreate {
  name: string;
  description?: string;
  email: string;
}
/** StripeService - stripe logic */
@Injectable()
export class StripeService {
  /** logger */
  private readonly logger = new Logger(StripeService.name);

  // Set your secret key. // ! Remember to switch to your live secret key in production!
  // See your keys here: https://dashboard.stripe.com/account/apikeys

  async create({name, description, email}: ICreate) {
    let customer;
    try {
      customer = await Stripe.customers.create({
        name,
        description,
        email,
      });
    } catch (error) {
      throw new HttpException(`Stripe error: ${error}, please try later`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`create customer ${email}`);

    return customer;
  }

  async createCard(customerId: string, source: string): Promise<CardInterface> {
    let userCard: CardInterface;
    try {
      userCard = await Stripe.customers.createSource(
        customerId,
        {
          source,
        },
      );
    } catch (error) {
      throw new HttpException(`Stripe error. \n ${error} \n Please try later`, HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`createCard customerId: ${customerId}, source: ${source}`);

    return userCard;
  }

  async deleteCard(customerId: string, source: string = null): Promise<DeleteCardInterface> {
    let userCard;
    try {
      userCard = await Stripe.customers.deleteSource(
        customerId,
        source,
      );
    } catch (error) {
      throw new HttpException(`Stripe error. \n ${error} \n Please try later`, HttpStatus.BAD_REQUEST);
    }
    this.logger.log(`deleteCard customer: ${customerId}, source: ${source}`);

    return userCard;
  }

  async getCardList(customerId: string, limit: number = 5): Promise<CardList> {
    let userCard;
    try {
      userCard = await Stripe.customers.listSources(
        customerId,
        {
          object: 'card',
          limit,
        },
      );
    } catch (error) {
      throw new HttpException(`Stripe error. \n ${error} \n Please try later`, HttpStatus.BAD_REQUEST);
    }
    this.logger.log(`getCardList by: ${customerId}`);

    return userCard;
  }

  async makeTransaction({ customer, source, amount, currency, description = config.stripe.defaultTransactionDescription }: TransactionInterface) {
    let charge;
    try {
      charge = await Stripe.charges.create({
        amount, // amount
        currency,
        customer, // Previously stored, then retrieved
        source,  //  e.g card_kldlkns...
        description,
      });
    } catch (error) {
      throw new HttpException(`Stripe error: ${error}, please try later`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.logger.log(`makeTransaction cusomer: ${customer}, amount: ${amount}`);

    return charge;
  }
}
