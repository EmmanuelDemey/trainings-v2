import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Who is calling: the API gateway in front of this API has authenticated the
 * user and forwards their id in `x-user-id`. This guard lets every request
 * through — it only reads who it is.
 */
@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.header('x-user-id');
    // TODO (step 1): set the user of the Sentry events of this request — its id only.
    void userId;
    return true;
  }
}
