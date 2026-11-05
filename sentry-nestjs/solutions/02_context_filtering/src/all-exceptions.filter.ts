import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import type { Response } from 'express';

/**
 * The app's catch-all filter: every error becomes the same JSON shape. Because it
 * catches EVERYTHING, Nest's own exception handling — and anything hooked into
 * it — never sees an error again.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // Reports the error to Sentry, then runs this catch — except for an
  // HttpException (a 404, a 400…): the caller's doing, not a bug.
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';
    if (status >= 500) this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    response.status(status).json({ statusCode: status, message });
  }
}
