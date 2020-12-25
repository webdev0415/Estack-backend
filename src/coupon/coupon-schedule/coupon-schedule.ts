import { Injectable } from '@nestjs/common';
import { CouponScheduleRepository } from './coupon-schedule-repository.service';

export interface IJob {
  id: string;
  timeWhenTheJobWillBeCalled: Date;
}

@Injectable()
export class CouponSchedule {
  private INTERVAL_PERIOD = 60000; // 1 min

  constructor(private readonly service: CouponScheduleRepository) {
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
