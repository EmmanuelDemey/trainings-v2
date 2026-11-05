import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

/**
 * The app's catch-all filter: every error becomes the same JSON shape. Because it
 * catches EVERYTHING, Nest's own exception handling — and anything hooked into
 * it — never sees an error again.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  // TODO (step 4): this filter swallows every error before Sentry can see it.
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';
    if (status >= 500) this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    response.status(status).json({ statusCode: status, message });
  }
}
