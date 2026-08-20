import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { requestLogging, logger } from './logging.ts';
import { HttpError, NotFoundError } from './errors.ts';

const app = express();
app.use(express.json());

// BEFORE the routes: every log line emitted while handling a request — from any
// depth — then carries its request id.
app.use(requestLogging());

/**
 * Demo route — throw an `HttpError` subclass instead of writing the response by
 * hand, and let the central error handler turn it into an HTTP response.
 */
app.get('/hello/:name', (req, res) => {
  if (req.params.name === 'unknown') {
    throw new NotFoundError('user not found');
  }

  logger().info({ name: req.params.name }, 'greeting');
  res.json({ message: `Hello, ${req.params.name}!` });
});

/**
 * Central error handler.
 *
 * Express 5 forwards errors thrown in (async) handlers here automatically.
 */
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger().error({ err }, 'request failed');

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Anything that is not an `HttpError` is a bug, not a domain outcome: the
  // client gets a generic message, the details stay in the log above. Echoing
  // `err.message` here is how stack traces and SQL end up in a browser tab.
  res.status(500).json({ error: 'Internal Server Error' });
};
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  logger().info({ port }, 'server listening');
});
