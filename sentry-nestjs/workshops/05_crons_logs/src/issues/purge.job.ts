import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
  // TODO (step 1): a cron monitor 'nightly-purge' — `@SentryCron(…)` with the
  // same schedule, its time zone, a check-in margin and a max runtime.
  async run(): Promise<number> {
    const purged = await this.repository.purgeClosed(this.retentionDays);
    this.logger.log(`Purged ${purged} closed issues`);
    return purged;
  }
}
