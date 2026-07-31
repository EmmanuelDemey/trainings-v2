/**
 * HTTP error hierarchy.
 *
 * Every error carries the HTTP `statusCode` it should map to, so the central
 * error handler can translate any thrown `HttpError` into a response without a
 * giant `switch`.
 */

export class HttpError extends Error {
  // TODO: add a public readonly `statusCode: number` field.
  // TODO: build a constructor `(statusCode, message)` that calls `super(message)`,
  //       assigns `statusCode`, and sets `this.name = new.target.name`.
  constructor(message: string) {
    super(message);
    // TODO: remove this once the real constructor is implemented.
  }
}

// TODO: NotFoundError extends HttpError with statusCode 404 (default message "Not Found").

// TODO: BadRequestError extends HttpError with statusCode 400 (default message "Bad Request").

// TODO: UnauthorizedError extends HttpError with statusCode 401 (default message "Unauthorized").
