import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller.js';
import { IssuesRepository } from './issues.repository.js';
import { IssuesService } from './issues.service.js';
import { PurgeJob } from './purge.job.js';

@Module({
  controllers: [IssuesController],
  providers: [IssuesService, IssuesRepository, PurgeJob],
  exports: [IssuesService, PurgeJob],
})
export class IssuesModule {}
