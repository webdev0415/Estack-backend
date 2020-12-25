import config from '../../../config';
import { Queue, Job, JobStatusClean } from 'bull';

import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  private jobId: string | number;

  constructor(
    @InjectQueue(config.cron.name) private readonly cronQueue: Queue,
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.cleanAll().then(() => this.start());

    this.cronQueue.process(async () => {
      try {
        this.logger.warn('Cron process...');
        await this.run();
        this.logger.warn('Cron fetching done!');
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  async start(): Promise<string| number> {
    const job = await this.cronQueue.add({}, { repeat: { cron: config.timeSchedule } });

    this.jobId = job.id;

    return this.jobId;
  }

  get(): Promise<Job> {
    return this.cronQueue.getJob(this.jobId);
  }

  cleanAll() {
    return Promise.all(
      ['delayed', 'failed', 'active', 'paused'].map((d: JobStatusClean) => this.cronQueue.clean(1, d)),
    );
  }

  async pause(): Promise<string> {
    await this.cronQueue.pause();

    return 'paused';
  }

  async resume(): Promise<string> {
    await this.cronQueue.resume();

    return 'resumed';
  }

  async run() {
    this.subscriptionService.updateCustomerCount();
    this.subscriptionService.updateFinishedSubscriptions();
  }
}
