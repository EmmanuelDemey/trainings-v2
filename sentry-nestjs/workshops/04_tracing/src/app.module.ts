import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { AllExceptionsFilter } from './all-exceptions.filter.js';
import { AuthController } from './auth.controller.js';
import { HealthController } from './health.controller.js';
import { IssuesModule } from './issues/issues.module.js';
import { UserGuard } from './user.guard.js';

@Module({
  imports: [
    // First: its interceptor names each request's events after its route.
    SentryModule.forRoot(),
    IssuesModule,
  ],
  controllers: [HealthController, AuthController],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: UserGuard },
  ],
})
export class AppModule {}
