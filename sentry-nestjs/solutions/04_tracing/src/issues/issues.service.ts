import { Injectable, NotFoundException } from '@nestjs/common';
import { SentryTraced } from '@sentry/nestjs';
import type { Issue, NewIssue } from './issue.model.js';
import { IssuesRepository } from './issues.repository.js';

export interface ScoredIssue extends Issue {
  score: number;
}

@Injectable()
export class IssuesService {
  constructor(private readonly repository: IssuesRepository) {}

  findAll(): Promise<Issue[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<ScoredIssue> {
    const issue = await this.repository.findOne(id);
    if (!issue) {
      // Expected: the caller asked for something that does not exist.
      throw new NotFoundException(`Issue ${id} not found`);
    }
    return { ...issue, score: this.score(issue) };
  }

  // A span around a method, named 'issues.score' (its op), without touching its body.
  @SentryTraced('issues.score')
  score(issue: Issue): number {
    return (4 - issue.priority) * 10 + (issue.assignee ? 0 : 5) + (issue.status === 'open' ? 1 : 0);
  }

  async create(input: NewIssue): Promise<Issue> {
    const issue = await this.repository.create(input);
    return issue;
  }
}
