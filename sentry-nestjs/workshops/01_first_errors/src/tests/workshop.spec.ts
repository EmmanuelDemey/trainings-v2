import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp, flushed } from './app.js';
import { sentry } from './setup.js';

/**
 * Workshop 01 — First errors. Given, and red on the starter. These specs start
 * the SDK with YOUR initSentry() (see setup.ts), then read what would have been
 * sent to Sentry. Keep them running while you work:
 *
 *   npm run test:watch
 */

describe('a bug in the API is reported', () => {
  it('sends one event when the database fails, named after the route', async () => {
    await using app = await createApp();

    const response = await request(app.getHttpServer()).get('/issues/13');
    await flushed();

    expect(response.status).toBe(500);
    const errors = sentry.errors();
    expect(errors).toHaveLength(1);
    expect(sentry.messageOf(errors[0])).toBe('Database connection lost');
    // The route template, not the URL: /issues/13 and /issues/14 are the same endpoint.
    expect(errors[0].transaction).toBe('GET /issues/:id');
  });

  it('keeps the JSON error response of the app', async () => {
    await using app = await createApp();

    const response = await request(app.getHttpServer()).get('/issues/13');

    expect(response.body).toEqual({ statusCode: 500, message: 'Internal server error' });
  });
});

describe('what the caller did wrong is not a bug', () => {
  it('sends nothing for a 404', async () => {
    await using app = await createApp();

    const response = await request(app.getHttpServer()).get('/issues/999');
    await flushed();

    expect(response.status).toBe(404);
    expect(sentry.errors()).toHaveLength(0);
  });

  it('sends nothing for an invalid form (400)', async () => {
    await using app = await createApp();

    const response = await request(app.getHttpServer()).post('/issues').send({ title: '' });
    await flushed();

    expect(response.status).toBe(400);
    expect(sentry.errors()).toHaveLength(0);
  });

  it('sends nothing when all is well', async () => {
    await using app = await createApp();

    const response = await request(app.getHttpServer()).get('/issues/1');
    await flushed();

    expect(response.status).toBe(200);
    expect(sentry.errors()).toHaveLength(0);
  });
});

describe('the SDK is configured', () => {
  it('reports the environment it runs in', async () => {
    await using app = await createApp();

    await request(app.getHttpServer()).get('/issues/13');
    await flushed();

    // Vitest sets NODE_ENV to 'test'.
    expect(sentry.errors()[0]?.environment).toBe('test');
  });
});
