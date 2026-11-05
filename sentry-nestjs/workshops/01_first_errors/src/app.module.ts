import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter.js';
import { AuthController } from './auth.controller.js';
import { HealthController } from './health.controller.js';
import { IssuesModule } from './issues/issues.module.js';

@Module({
  imports: [
    // TODO (step 3): SentryModule.forRoot(), first.
    IssuesModule,
  ],
  controllers: [HealthController, AuthController],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
