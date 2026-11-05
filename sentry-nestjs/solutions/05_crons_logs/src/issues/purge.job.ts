import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SentryCron } from '@sentry/nestjs';
import { IssuesRepository } from './issues.repository.js';

/**
 * Every night at 03:00, removes the closed issues older than the retention.
 * When it fails, nobody knows; when it does not run at all, nobody knows either.
 */
@Injectable()
export class PurgeJob {
  private readonly logger = new Logger(PurgeJob.name);

  /** How many days a closed issue is kept. Ops set it from the environment. */
  retentionDays = Number(process.env.PURGE_RETENTION_DAYS ?? 30);

  constructor(private readonly repository: IssuesRepository) {}

  @Cron('0 3 * * *', { timeZone: 'Europe/Paris' })
  // A check-in at the start, one at the end — ok or error. Sentry knows the
  // schedule: a run that never starts is "missed", without a line of code here.
  @SentryCron('nightly-purge', {
    schedule: { type: 'crontab', value: '0 3 * * *' },
    timezone: 'Europe/Paris',
    checkinMargin: 5, // minutes late before "missed"
    maxRuntime: 10, // minutes before "timed out"
  })
  async run(): Promise<number> {
    const purged = await this.repository.purgeClosed(this.retentionDays);
    this.logger.log(`Purged ${purged} closed issues`);
    return purged;
  }
}
