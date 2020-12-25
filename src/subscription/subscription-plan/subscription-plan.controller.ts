import { ApiAcceptedResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlanDto } from './dto/subscription-plan.dto';
import { MongoIdDto } from '../../../util/dto/mongo-id.dto';
import { CreateIndividualSubscriptionPlanDto } from './dto/create-individual.subscription-plan.dto';
import { PaginationSubscriptionPlanDto } from './dto/pagination.subscription-plan.dto';
import { SubscriptionService } from '../subscription.service';
import { Roles } from '../../../util/decorators/role.decorator';
import { UpdateSubscriptionDto } from '../dto/update.subscription.dto';

@ApiTags('subscription-plan')
@Controller('subscription-plan')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('service')
  @Roles({ roleGuard: 'root' })
  @ApiOkResponse({ type: SubscriptionPlanDto, isArray: true })
  getList(@Query() options: PaginationSubscriptionPlanDto) {
    return this.subscriptionPlanService.getList(options);
  }

  @Get('fetch')
  @ApiOkResponse({ type: SubscriptionPlanDto })
  getBy(@Query() options: any) {
    return this.subscriptionPlanService.getBy(options);
  }

  @Post('service')
  @Roles({ roleGuard: 'root' })
  @ApiCreatedResponse({ type: SubscriptionPlanDto })
  createIndividualPlan(@Body() data: CreateIndividualSubscriptionPlanDto) {
    return this.subscriptionPlanService.createIndividualPlan(data);
  }

  @Patch('service')
  @Roles({ roleGuard: 'root' })
  @ApiAcceptedResponse()
  updateIndividualPlans(@Body() data: UpdateSubscriptionDto) {
    return this.subscriptionService.updateIndividualPlans(data);
  }

  @Patch('service/:id')
  @Roles({ roleGuard: 'root' })
  @ApiAcceptedResponse()
  updatePlan(@Param() { id }: MongoIdDto, @Body() data: Partial<SubscriptionPlanDto>) {
    return this.subscriptionService.updatePlan(id, data);
  }

  @Delete('service/:id')
  @Roles({ roleGuard: 'root' })
  @ApiAcceptedResponse()
  deletePlan(@Param() { id }: MongoIdDto) {
    return this.subscriptionService.deletePlan(id);
  }
}
