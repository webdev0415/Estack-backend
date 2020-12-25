import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { CronService } from './cron.service';
import { Roles } from '../../../util/decorators/role.decorator';

@ApiTags('subscription-schedule')
@Controller('subscription-schedule/service')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get()
  @Roles({ roleGuard: 'root' })
  @ApiForbiddenResponse()
  get() {
    return this.cronService.get();
  }

  @Post('start')
  @Roles({ roleGuard: 'root' })
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  start() {
    return this.cronService.start();
  }

  @Post('pause')
  @Roles({ roleGuard: 'root' })
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  pause() {
    return this.cronService.pause();
  }

  @Delete('close')
  @Roles({ roleGuard: 'root' })
  @ApiForbiddenResponse()
  close() {
    return this.cronService.cleanAll();
  }

  @Post('resume')
  @Roles({ roleGuard: 'root' })
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  resume(): Promise<string> {
    return this.cronService.resume();
  }

  @Post('run')
  @Roles({ roleGuard: 'root' })
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  run() {
    return this.cronService.run();
  }
}
