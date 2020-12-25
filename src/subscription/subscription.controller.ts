import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {}
