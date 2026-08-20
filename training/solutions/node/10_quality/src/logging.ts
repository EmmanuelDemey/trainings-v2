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
 *
 * That last part is the point. The alternative is threading a `logger` (or a
 * `ctx`) through every function signature down to the repository layer, for ever.
 */

interface RequestStore {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestStore>();

const rootLogger: Logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  // JSON on stdout is the right default: it is what a log shipper wants. Pipe
  // it through `npx pino-pretty` when you are the one reading it.
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});

/**
 * Returns a logger bound to the current request id (falls back to the root
 * logger when called outside of a request context).
 */
export function logger(): Logger {
  const store = storage.getStore();
  // `child` binds the field once; every line from this logger carries it, and
  // pino serialises the bound fields ahead of time rather than per call.
  return store ? rootLogger.child({ requestId: store.requestId }) : rootLogger;
}

/**
 * Express middleware that:
 *  - generates a request id (reuse an incoming `x-request-id` header if present),
 *  - runs the rest of the request inside `storage.run(...)`,
 *  - logs the start and the completion (on `res` `'finish'`) of the request.
 */
export function requestLogging(): RequestHandler {
  return (req, res, next) => {
    // Reusing the inbound header is what makes the id survive a hop between
    // services — that is the whole value of a correlation id.
    const requestId = (req.headers['x-request-id'] as string | undefined) ?? randomUUID();
    res.setHeader('x-request-id', requestId);

    const startedAt = performance.now();

    // Everything `next()` triggers — sync, promises, timers, I/O callbacks —
    // runs inside this context and sees the same store.
    storage.run({ requestId }, () => {
      logger().info({ method: req.method, url: req.originalUrl }, 'request received');

      // 'finish' fires once the response has been flushed, so the status code
      // and the duration are both final by then.
      res.once('finish', () => {
        logger().info(
          {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs: Math.round(performance.now() - startedAt),
          },
          'request completed',
        );
      });

      next();
    });
  };
}
