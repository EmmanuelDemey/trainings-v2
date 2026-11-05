import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
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
    // The isolation scope of this request — not the global one: two concurrent
    // requests never see each other's user. The id only: no email, no name.
    if (userId) Sentry.setUser({ id: userId });
    return true;
  }
}
