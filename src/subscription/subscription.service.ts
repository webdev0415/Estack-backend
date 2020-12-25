import * as _ from 'lodash';
import * as moment from 'moment';
import config from '../../config';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SubscriptionDbDto } from './dto/subscription-db.dto';
import { SubscriptionPlanService } from './subscription-plan/subscription-plan.service';
import { SubscriptionPlanDbDto } from './subscription-plan/dto/subscription-plan.db.dto';
import { SubscriptionRepository } from './subscription.repository';
import { UpdateSubscriptionDto } from './dto/update.subscription.dto';
import { sendEmail } from '../../util/globals';
import { subscriptionChangeNotification } from '../../util/htmlPages/subscriptionChangeNotification';
import { SubscriptionPlanDto } from './subscription-plan/dto/subscription-plan.dto';
import { SubscriptionScheduleRepository } from './subscription-schedule/subscription-schedule.repository';
import { StripeService } from '../../util/spripe/stripe';
import { successPaymentNotification } from '../../util/htmlPages/successPaymentNotification';
import { subscriptionBegins } from '../../util/htmlPages/subscriptionBegins';
import { subscriptionBeginsNotifyOwner } from '../../util/htmlPages/subscriptionBeginsNotifyOwner';
import { subscriptionStopped } from '../../util/htmlPages/subscriptionStopped';
import { subscriptionStoppedNotifyOwner } from '../../util/htmlPages/subscriptionStoppedNotifyOwner';

@Injectable()
export class SubscriptionService {

  /**
   * Subscription Service
   * @param subscriptionPlanService
   * @param subscriptionRepository
   * @param subscriptionScheduleRepository
   * @param stripeService
   */
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionScheduleRepository: SubscriptionScheduleRepository,
    private readonly stripeService: StripeService,
    ) {}

  private async sendSubscriptionChangeNotification(email: string, price): Promise<void> {
    sendEmail(email, config.mail.data.subscriptionChanges.subject, subscriptionChangeNotification(price));
  }

  private async sendSubscriptionBeginsNotification(email: string): Promise<void> {
    sendEmail(email, config.mail.data.subscriptionBegins.subject, subscriptionBegins());
    sendEmail(config.mail.data.defaultEmail, config.mail.data.subscriptionBegins.subject, subscriptionBeginsNotifyOwner(email));
  }

  private async sendSubscriptionStoppedNotification(email: string): Promise<void> {
    sendEmail(email, config.mail.data.subscriptionStopped.subject, subscriptionStopped());
    sendEmail(config.mail.data.defaultEmail, config.mail.data.subscriptionStopped.subject, subscriptionStoppedNotifyOwner(email));
  }

  private async chargeSubscription(obj, param) {
    const { data } = await this.stripeService.getCardList(obj.stripeId);

    const unsuccess = () => {
      if (!Object.keys(param).length) {
        return;
      }

      if (obj.businessId && param.isActive === false) {
        this.sendSubscriptionStoppedNotification(obj.email);

        this.subscriptionScheduleRepository.updateLoyaltyProgram({businessId: obj.businessId}, param);
      }

      return this.subscriptionRepository.updateOne({merchantId: obj._id}, param);
    };

    if (!(data && data[0])) {
      return unsuccess();
    }

    if (obj.businessId) {
      param.businessId = obj.businessId;
    }

    param.email = obj.email;

    return this.payment(obj._id, obj.stripeId, data[0].id, param, unsuccess);
  }

   async payment(merchantId: string, stripeId: string, source: string, param, unsuccessFunction?) {
     const {plan, subscription} = await this.getPlanByMerchantId(merchantId);

     return this.stripeService.makeTransaction({ customer: stripeId, source, amount: plan.price * 100, currency: 'usd' })
       .then((charge) => {

         sendEmail(param.email, config.mail.data.successPayment.subject, successPaymentNotification(charge.receipt_url));

         let endOfSubscription;

         if (moment().isBefore(subscription.endOfSubscription) && plan.period === 'yearly') {
           endOfSubscription = moment(subscription.endOfSubscription).add(1, 'year').toISOString();
         } else if (moment().isBefore(subscription.endOfSubscription)) {
           endOfSubscription = moment(subscription.endOfSubscription).add(1, 'month').toISOString();
         } else if (plan.period === 'yearly') {
           endOfSubscription = moment().add(1, 'year').toISOString();
         } else {
           endOfSubscription = moment().add(1, 'month').toISOString();
         }

         const customerCount = param.customerCount ? {customerCount: param.customerCount} : {};

         if (param.businessId) {
           this.subscriptionScheduleRepository.updateLoyaltyProgram({businessId: param.businessId}, { isActive: true });
         }

         return this.subscriptionRepository.updateOne({merchantId},
           {
             ...customerCount,
             isActive: true,
             endOfSubscription,
             currentEnd: moment(endOfSubscription).add(config.subscription.grace, 'days').toISOString(),
             $inc : {paidCount: 1}},
         );
       })
       .catch((error) => {
         if (!unsuccessFunction) {
           throw new HttpException(`Stripe error: ${error}, please try later`, HttpStatus.INTERNAL_SERVER_ERROR);
         }

         return unsuccessFunction();
       },
   );
   }

  async updateCustomerCount() {
    const merchantList = await this.subscriptionScheduleRepository.getMerchantsCustomerCount();

    merchantList.forEach(i => {
      this.sendSubscriptionBeginsNotification(i.email);

      this.chargeSubscription(i, {
        customerCount: config.customersNumThreshold,
        endOfSubscription: moment().toISOString(),
        currentEnd: moment().add(config.subscription.grace, 'days').toISOString(),
      });
    });
  }

  async updateFinishedSubscriptions() {
    const merchantList = await this.subscriptionScheduleRepository.getFinishedSubscriptions();

    merchantList.forEach(i => {
      const param: any = {};

      if (moment().isAfter(i.currentEnd)) {
        param.isActive = false;
      }

      return this.chargeSubscription(i, param);
    });
  }

  async create(data) {

    const type = data.quantityOfPos && data.quantityOfPos > 1 ? 'enterprise' : 'boutique';

    const { _id } = await this.subscriptionPlanService.getFirstBy( {type, period: data.paymentCycle });

    const paymentCycle =  data.paymentCycle;

    data = _.omit(data, 'paymentCycle');

    data.subscriptionPlanId = _id;

    return { ... await this.subscriptionRepository.create( data ), paymentCycle};
  }

  async getByUserId(userId: string) {
    const req = await this.subscriptionRepository.aggregateByUserId(userId);

    const data = _.first(req);

    const plan: Partial<SubscriptionPlanDbDto> = await this.subscriptionPlanService.getFirstBy({_id: data.subscriptionPlanId});

    return {...data, price: plan.price, type: plan.type, paymentCycle: plan.period};
  }

  async updatePeriod(dbSubscription, data): Promise<SubscriptionDbDto> {
    if (data.paymentCycle) {
      const type = dbSubscription.quantityOfPos > 1 ? 'enterprise' : 'boutique';

      const newPlan: Partial<SubscriptionPlanDbDto> =
        await this.subscriptionPlanService.getFirstBy( { type, period: data.paymentCycle } );

      data.subscriptionPlanId = newPlan._id;

      data = _.omit(data, 'paymentCycle');
    }

    return this.subscriptionRepository.updateOne( { _id: dbSubscription._id }, data);
  }

  async deletePlan(id: string) {
    const emailData = await this.subscriptionPlanService.getEmailData(id);

    const deletedPlan = await this.subscriptionPlanService.deletePlan(id);

    const subscriptionList = await this.subscriptionRepository.getBy({subscriptionPlanId: deletedPlan._id});

    const subscriptionObj = subscriptionList.reduce((acc, cur) => {
      if (cur.quantityOfPos > 1) {
        acc.enterprise[acc.enterprise.length] = cur._id.toString();
      } else {
        acc.boutique[acc.boutique.length] = cur._id.toString();
      }

      return acc;
    }, {boutique: [], enterprise: []});

    const func = async (type) => {
      if (subscriptionObj[type].length) {

        const newPlan = await this.subscriptionPlanService.getFirstBy( { type, period: deletedPlan.period } );

        emailData[0].data.filter( i => subscriptionObj[type].includes( i.subscriptionId.toString() ) )
            .forEach( i => this.sendSubscriptionChangeNotification( i.email, newPlan.price ) );

        return this.subscriptionRepository.updateMany(
          { _id: { $in: subscriptionObj[type] } }, { subscriptionPlanId: newPlan._id },
        );
      }
    };

    return Promise.all([func('boutique'), func('enterprise')]);
  }

  async updatePlan(id: string, data: Partial<SubscriptionPlanDto>) {
    const emailData = await this.subscriptionPlanService.getEmailData(id);

    if (emailData[0] && data.price) {
     emailData[0].data.forEach(i => this.sendSubscriptionChangeNotification(i.email, data.price));
    }

    return this.subscriptionPlanService.updatePlan(id, data);
  }

  async updateIndividualPlans(data: UpdateSubscriptionDto) {
    const plan = await this.subscriptionPlanService.getFirstBy( { _id: data.id});

    if (data.created.length) {

      await this.subscriptionRepository.updateMany(
        { _id: { $in: data.created.map(i => i.subscriptionId) } },
        { subscriptionPlanId:  data.id},
      );

      data.created.forEach(i => this.sendSubscriptionChangeNotification(i.email, plan.price));
    }

    if (data.deleted.length) {
      const subscriptionList = await this.subscriptionRepository.getBy({_id: { $in: data.deleted.map(i => i.subscriptionId) }});

      const subscriptionObj = subscriptionList.reduce((acc, cur) => {
        if (cur.quantityOfPos > 1) {
          acc.enterprise[acc.enterprise.length] = cur._id.toString();
        } else {
          acc.boutique[acc.boutique.length] = cur._id.toString();
        }

        return acc;
      }, {boutique: [], enterprise: []});

      const func = async (type) => {
        if (subscriptionObj[type].length) {

          const newPlan = await this.subscriptionPlanService.getFirstBy( { type, period: plan.period});

          data.deleted.filter( i => subscriptionObj[type].includes( i.subscriptionId.toString() ) )
              .forEach( i => this.sendSubscriptionChangeNotification( i.email, plan.price ) );

          return this.subscriptionRepository.updateMany(
            { _id: { $in: subscriptionObj[type] } }, { subscriptionPlanId: newPlan._id },
          );
        }
      };

      await Promise.all([func('boutique'), func('enterprise')]);
    }

    return this.subscriptionPlanService.getEmailData();
  }

  async getPlanByMerchantId(merchantId: string) {
    const subscription = await this.subscriptionRepository.getOne( { merchantId });

    const plan = await this.subscriptionPlanService.getFirstBy({_id: subscription.subscriptionPlanId});

    return {plan, subscription};
  }
}
