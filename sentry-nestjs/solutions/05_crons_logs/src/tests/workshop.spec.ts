import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { PurgeJob } from '../issues/purge.job.js';
import { createApp, flushed } from './app.js';
import { sentry } from './setup.js';

/**
 * Workshop 05 — Cron monitors & logs. Given, and red on the starter. The specs
 * do not wait for 03:00: they call the job as the scheduler would.
 *
 *   npm run test:watch
 */

describe('steps 1 and 2 — the nightly purge is monitored', () => {
  it('checks in when it starts, then when it succeeds', async () => {
    await using app = await createApp();

    await app.get(PurgeJob).run();
    await flushed();

    const checkIns = sentry.checkIns();
    expect(checkIns.map((checkIn) => [checkIn.monitor_slug, checkIn.status])).toEqual([
      ['nightly-purge', 'in_progress'],
      ['nightly-purge', 'ok'],
    ]);
    // The second check-in closes the first one.
    expect(checkIns[1].check_in_id).toBe(checkIns[0].check_in_id);
  });

  it('tells Sentry its schedule, so that a missed run is detected', async () => {
    await using app = await createApp();

    await app.get(PurgeJob).run();
    await flushed();

    expect(sentry.checkIns()[0]?.monitor_config).toMatchObject({
      schedule: { type: 'crontab', value: '0 3 * * *' },
      timezone: 'Europe/Paris',
      checkin_margin: expect.any(Number),
      max_runtime: expect.any(Number),
    });
  });

  it('checks in an error when it fails', async () => {
    await using app = await createApp();
    const job = app.get(PurgeJob);
    job.retentionDays = Number.NaN; // what a typo in PURGE_RETENTION_DAYS does

    await expect(job.run()).rejects.toThrow('Purge refused');
    await flushed();

    expect(sentry.checkIns().map((checkIn) => checkIn.status)).toEqual(['in_progress', 'error']);
  });
});

describe('step 3 — a structured log when an issue is created', () => {
  it("sends an 'info' log with the id of the new issue, searchable", async () => {
    await using app = await createApp();

    const response = await request(app.getHttpServer()).post('/issues').send({ title: 'Export to CSV' });
    await flushed();

    const log = sentry.logs().find((item) => item.body.includes('created'));
    expect(log).toBeDefined();
    expect(log?.level).toBe('info');
    expect(log?.body).toBe(`Issue ${response.body.id} created`);
    expect(sentry.attr(log!, 'issue.id')).toBe(response.body.id);
    // The template stays a template: Sentry groups the logs by it.
    expect(sentry.attr(log!, 'sentry.message.template')).toBe('Issue %s created');
  });

  it('attaches the log to the trace of the request', async () => {
    await using app = await createApp();
    const traceId = 'fedcba9876543210fedcba9876543210';

    await request(app.getHttpServer())
      .post('/issues')
      .set('sentry-trace', `${traceId}-0123456789abcdef-1`)
      .send({ title: 'Export to CSV' });
    await flushed();

    expect(sentry.logs().find((item) => item.body.includes('created'))?.trace_id).toBe(traceId);
  });
});
