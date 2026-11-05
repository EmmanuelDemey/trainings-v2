import { Module } from '@nestjs/common';
import { IssuesController } from './issues.controller.js';
import { IssuesRepository } from './issues.repository.js';
import { IssuesService } from './issues.service.js';

@Module({
  controllers: [IssuesController],
  providers: [IssuesService, IssuesRepository],
  exports: [IssuesService],
})
export class IssuesModule {}
