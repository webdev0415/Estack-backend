import { Injectable } from '@nestjs/common';
import { SubscriptionScheduleRepository } from './subscription-schedule.repository';

export interface IJob {
  id: string;
  timeWhenTheJobWillBeCalled: Date;
}

@Injectable()
export class SubscriptionSchedule {
  private INTERVAL_PERIOD = 7200000; // 2 hours

  constructor(private readonly service: SubscriptionScheduleRepository) {
  }

  public run(): void {
    setInterval(async () => {
      const currTimeMills = new Date().getTime();

      const JobList: IJob[] = await this.service.getJobListForGivenTimePeriod({
        startTimeMs: currTimeMills,
        endTimeMs: currTimeMills + this.INTERVAL_PERIOD,
      });

      for (const job of JobList) {
        this.scheduleJob(job, currTimeMills); // schedule job call
      }
    }, this.INTERVAL_PERIOD);
  }

  private async scheduleJob(job: IJob, currentTimeMills: number): Promise<void> {
    const timeAfterWhichJobWillBeCalled = new Date(job.timeWhenTheJobWillBeCalled).getTime() - currentTimeMills; // calc when job due comes

    setTimeout(() => this.service.scheduledJob(job), timeAfterWhichJobWillBeCalled);
  }
}
