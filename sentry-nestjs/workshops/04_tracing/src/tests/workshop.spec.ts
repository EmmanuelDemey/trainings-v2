import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp, flushed } from './app.js';
import { sentry } from './setup.js';

/**
 * Workshop 04 — Tracing. Given, and red on the starter.
 *
 *   npm run test:watch
 */

const TRACE_ID = '0123456789abcdef0123456789abcdef';
// What the browser sends: its trace id, the id of its span, and its decision (1 = sampled).
const FROM_THE_BROWSER = `${TRACE_ID}-89abcdef01234567-1`;

async function openIssue(id: number, headers: Record<string, string> = {}) {
  await using app = await createApp();
  const response = await request(app.getHttpServer()).get(`/issues/${id}`).set(headers);
  await flushed();
  return response;
}

describe('step 1 — what is traced', () => {
  it('traces a request to the API', async () => {
    await openIssue(1);

    const segments = sentry.spans().filter((span) => span.is_segment);
    expect(segments.map((span) => span.name)).toContain('GET /issues/:id');
  });

  it('does not trace the health checks', async () => {
    await using app = await createApp();
    await request(app.getHttpServer()).get('/health');
    await flushed();

    expect(sentry.spans()).toHaveLength(0);
  });

  it("respects the browser's decision not to sample", async () => {
    await openIssue(1, { 'sentry-trace': `${TRACE_ID}-89abcdef01234567-0` });

    expect(sentry.spans()).toHaveLength(0);
  });
});

describe("step 2 — the API continues the browser's trace", () => {
  it('puts the request in the trace of the browser', async () => {
    await openIssue(1, { 'sentry-trace': FROM_THE_BROWSER });

    const segment = sentry.spans().find((span) => span.is_segment);
    expect(segment?.name).toBe('GET /issues/:id');
    expect(segment?.trace_id).toBe(TRACE_ID);
    expect(segment?.parent_span_id).toBe('89abcdef01234567');
  });
});

describe('step 3 — a span around the scoring', () => {
  it("adds 'issues.score' to the trace of the request", async () => {
    await openIssue(1, { 'sentry-trace': FROM_THE_BROWSER });

    // @SentryTraced(op) names the span after the method, and gives it that op.
    const score = sentry.spans().find((span) => sentry.attr(span, 'sentry.op') === 'issues.score');
    expect(score).toBeDefined();
    expect(score?.name).toBe('score');
    expect(score?.trace_id).toBe(TRACE_ID);
  });
});

describe('step 4 — a span around the database read', () => {
  it("adds 'issues.repository.findOne' with the issue id", async () => {
    await openIssue(1, { 'sentry-trace': FROM_THE_BROWSER });

    const query = sentry.spans().find((span) => span.name === 'issues.repository.findOne');
    expect(query).toBeDefined();
    expect(sentry.attr(query!, 'sentry.op')).toBe('db.query');
    expect(sentry.attr(query!, 'issue.id')).toBe(1);
    expect(query?.trace_id).toBe(TRACE_ID);
  });

  it('marks the span as failed when the database fails', async () => {
    await openIssue(13, { 'sentry-trace': FROM_THE_BROWSER });

    const query = sentry.spans().find((span) => span.name === 'issues.repository.findOne');
    expect(query?.status).toBe('error');
  });
});
