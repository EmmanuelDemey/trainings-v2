import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { requestLogging, logger } from './logging.ts';
import { HttpError, NotFoundError } from './errors.ts';

const app = express();
app.use(express.json());

// TODO: mount the request-logging middleware BEFORE the routes.
// app.use(requestLogging());
void requestLogging;

/**
 * Demo route — throw an `HttpError` subclass instead of writing the response by
 * hand, and let the central error handler turn it into an HTTP response.
 */
app.get('/hello/:name', (req, res) => {
  // TODO: if `req.params.name === 'unknown'`, throw new NotFoundError('user not found').
  void NotFoundError;
  logger().info({ name: req.params.name }, 'greeting');
  res.json({ message: `Hello, ${req.params.name}!` });
});

/**
 * Central error handler.
 *
 * Express 5 forwards errors thrown in (async) handlers here automatically.
 */
const errorHandler: ErrorRequestHandler = (_err, _req, _res, _next) => {
  // TODO: log the error via `logger().error(...)`.
  // TODO: if `err instanceof HttpError`, respond with `err.statusCode` and
  //       `{ error: err.message }`; otherwise respond with `500` and a generic message.
  void HttpError;
  throw new Error('error handler not implemented');
};
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  logger().info({ port }, 'server listening');
});
