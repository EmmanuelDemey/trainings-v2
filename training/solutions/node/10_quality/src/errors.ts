/**
 * HTTP error hierarchy.
 *
 * Every error carries the HTTP `statusCode` it should map to, so the central
 * error handler can translate any thrown `HttpError` into a response without a
 * giant `switch`. Adding a status is adding a subclass — the handler never
 * changes.
 */

export class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // `new.target` is the class that was actually constructed, so a
    // `NotFoundError` reports `name === 'NotFoundError'` without every subclass
    // repeating the line. Hard-coding `'HttpError'` here would make every log
    // entry lie about which error was thrown.
    this.name = new.target.name;

    // Without this, the stack trace starts inside this constructor rather than
    // at the `throw` site. V8-only, hence the guard.
    Error.captureStackTrace?.(this, new.target);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}
