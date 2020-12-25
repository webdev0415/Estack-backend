import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SubscriptionPlanRepository } from './subscription-plan.repository';
import config from '../../../config';
import { CreateSubscriptionPlanDto } from './dto/create.subscription-plan.dto';
import { SubscriptionPlanDto } from './dto/subscription-plan.dto';
import { PaginationSubscriptionPlanDto } from './dto/pagination.subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    private readonly subscriptionPlanRepository: SubscriptionPlanRepository,
  ) {
    this.initGlobalPlan('boutique', 'monthly', config.subscription.boutique.monthlyPrice);
    this.initGlobalPlan('boutique', 'yearly', config.subscription.boutique.yearlyPrice);
    this.initGlobalPlan('enterprise', 'monthly', config.subscription.enterprise.monthlyPrice);
    this.initGlobalPlan('enterprise', 'yearly', config.subscription.enterprise.yearlyPrice);
  }

  private initGlobalPlan(type: string, period: string, price: number) {
    this.subscriptionPlanRepository.getFirstBy( { type, period })
      .then(res => (res
          ? {}
          : this.subscriptionPlanRepository.create({ type, period, price })
      ));
  }

  getEmailData(id?: string) {
    return this.subscriptionPlanRepository.getSubscriptionEmails(id);
  }

  async getFirstBy(data) {
    const plan = await this.subscriptionPlanRepository.getFirstBy(data);

    if (!plan) {
      Logger.warn('Default plan not exists');

      throw new NotFoundException('Subscription plan not found.');
    }

    return plan;
  }

  async getList(options: PaginationSubscriptionPlanDto) {
   const list = await this.subscriptionPlanRepository.pagination(options);

   list.emailData = await this.getEmailData();

   return list;
  }

  getBy(options: any) {
    return this.subscriptionPlanRepository.getBy(options);
  }

  createIndividualPlan(data: CreateSubscriptionPlanDto) {
    return this.subscriptionPlanRepository.create(data)
      .catch((e) => {
        Logger.error('Duplicate individual subscription ', e.message);

        throw new ForbiddenException('Duplicate individual subscription');
      } );
  }

  updatePlan(id: string, data: Partial<SubscriptionPlanDto>) {
    return this.subscriptionPlanRepository.updatePlan(id, data);
  }

  deletePlan(id: string) {
    return this.subscriptionPlanRepository.deletePlan(id);
  }
}
