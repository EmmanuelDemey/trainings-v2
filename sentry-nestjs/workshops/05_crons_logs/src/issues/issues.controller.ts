import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { CreateIssueDto } from './create-issue.dto.js';
import type { Issue } from './issue.model.js';
import { IssuesService, type ScoredIssue } from './issues.service.js';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issues: IssuesService) {}

  @Get()
  findAll(): Promise<Issue[]> {
    return this.issues.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ScoredIssue> {
    // On the isolation scope of THIS request: every event it sends carries it.
    Sentry.setTag('issue.id', id);
    return this.issues.findOne(id);
  }

  @Post()
  create(@Body() body: unknown): Promise<Issue> {
    return this.issues.create(CreateIssueDto.parse(body));
  }
}
