import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp, flushed } from './app.js';
import { sentry } from './setup.js';

/**
 * Workshop 02 — Context & filtering. Given, and red on the starter.
 *
 *   npm run test:watch
 */

describe('step 1 — who it happened to', () => {
  it('attaches the user of each request to its own event, even when requests overlap', async () => {
    await using app = await createApp();
    const server = app.getHttpServer();

    await Promise.all([
      request(server).get('/issues/13').set('x-user-id', 'u-1'),
      request(server).get('/issues/14').set('x-user-id', 'u-2'),
    ]);
    await flushed();

    const users = sentry
      .errors()
      .map((event) => [event.request?.url?.split('/').at(-1), event.user?.id])
      .sort();
    expect(users).toEqual([
      ['13', 'u-1'],
      ['14', 'u-2'],
    ]);
  });

  it('sends no user when the request has none', async () => {
    await using app = await createApp();

    await request(app.getHttpServer()).get('/issues/13').set('x-user-id', 'u-1');
    await request(app.getHttpServer()).get('/issues/14');
    await flushed();

    expect(sentry.errors()[1]?.user?.id).toBeUndefined();
  });
});

describe('step 2 — what it happened to', () => {
  it('tags the event with the issue the request was about', async () => {
    await using app = await createApp();

    await request(app.getHttpServer()).get('/issues/13');
    await flushed();

    expect(sentry.errors()[0]?.tags?.['issue.id']).toBe(13);
  });
});

describe('step 3 — one issue per cause', () => {
  it('groups every lost database connection together', async () => {
    await using app = await createApp();

    await request(app.getHttpServer()).get('/issues/13');
    await request(app.getHttpServer()).get('/issues/14');
    await flushed();

    const fingerprints = sentry.errors().map((event) => event.fingerprint);
    expect(fingerprints).toEqual([
      ['database-error', 'ECONNRESET'],
      ['database-error', 'ECONNRESET'],
    ]);
  });

  it('leaves the grouping of other errors to Sentry', async () => {
    await using app = await createApp();

    await request(app.getHttpServer()).post('/auth/login').send({ email: 'crash@example.com', password: 'x' });
    await flushed();

    expect(sentry.errors()[0]?.fingerprint).toBeUndefined();
  });
});

describe('step 4 — what never leaves the API', () => {
  async function crashTheLogin() {
    await using app = await createApp();
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.secret')
      .set('cookie', 'session=abc123')
      .set('x-forwarded-for', '203.0.113.7')
      .send({ email: 'crash@example.com', password: 'hunter2' });
    await flushed();
    const event = sentry.errors()[0];
    expect(event).toBeDefined();
    return event;
  }

  it('sends no request body — the password is in it', async () => {
    const event = await crashTheLogin();

    expect(JSON.stringify(event)).not.toContain('hunter2');
    expect(event.request?.data).toBeUndefined();
  });

  it('sends neither the cookies nor any header outside an allowlist', async () => {
    const event = await crashTheLogin();

    // A header left out is still listed, its value replaced by [Filtered].
    const sent = Object.entries(event.request?.headers ?? {}).filter(([, value]) => value !== '[Filtered]');
    expect(sent.map(([name]) => name.toLowerCase()).sort()).toEqual(['content-type']);
    expect(event.request?.cookies).toBeUndefined();
    expect(JSON.stringify(event)).not.toContain('abc123');
  });

  it("sends not the caller's IP address", async () => {
    const event = await crashTheLogin();

    expect(JSON.stringify(event)).not.toContain('203.0.113.7');
    expect(event.user?.ip_address).toBeUndefined();
  });
});
