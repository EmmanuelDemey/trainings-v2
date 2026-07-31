import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { pino } from 'pino';
import type { Logger } from 'pino';
import type { RequestHandler } from 'express';

/**
 * Structured logging with a per-request id propagated through AsyncLocalStorage.
 *
 * The middleware opens a new async context for each request, stores the request
 * id in it, and exposes `log(...)` helpers that automatically enrich every line
 * with that id — even from code that has no access to `req`.
 */

interface RequestStore {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestStore>();

// TODO: create the root pino logger (e.g. `pino({ level: process.env.LOG_LEVEL ?? 'info' })`).
const rootLogger: Logger = pino();

/**
 * Returns a logger bound to the current request id (falls back to the root
 * logger when called outside of a request context).
 */
export function logger(): Logger {
  // TODO: read the store with `storage.getStore()`; if present, return
  //       `rootLogger.child({ requestId: store.requestId })`, otherwise `rootLogger`.
  return rootLogger;
}

/**
 * Express middleware that:
 *  - generates a request id (reuse an incoming `x-request-id` header if present),
 *  - runs the rest of the request inside `storage.run(...)`,
 *  - logs the start and the completion (on `res` `'finish'`) of the request.
 */
export function requestLogging(): RequestHandler {
  return (_req, _res, _next) => {
    // TODO: const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    // TODO: res.setHeader('x-request-id', requestId);
    // TODO: storage.run({ requestId }, () => { logger().info('request received'); next(); });
    void randomUUID;
    throw new Error('requestLogging middleware not implemented');
  };
}
