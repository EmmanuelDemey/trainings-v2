import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { DatabaseError } from './database.error.js';
import type { Issue, NewIssue } from './issue.model.js';

const TITLES = [
  'Checkout button does nothing on Safari',
  'Search ignores accents',
  'Avatar upload fails over 2 MB',
  'Dark mode: unreadable labels',
  'Emails sent twice on signup',
  'Pagination resets on refresh',
];

/** Issues 13 and 14 live on a database shard that is down. */
const BROKEN_SHARD = new Set([13, 14]);

/**
 * An in-memory "database" — the same 42 issues as the React app. Issue 7 has
 * no assignee; issues 13 and 14 cannot be read.
 */
@Injectable()
export class IssuesRepository {
  private issues: Issue[] = Array.from({ length: 42 }, (_, index) => {
    const id = index + 1;
    return {
      id,
      title: id === 1 ? TITLES[0] : `${TITLES[id % TITLES.length]} (#${id})`,
      status: id % 3 === 0 ? 'closed' : 'open',
      assignee: id === 7 ? null : `user-${(id % 5) + 1}`,
      priority: ((id % 3) + 1) as Issue['priority'],
    };
  });

  async findAll(): Promise<Issue[]> {
    return this.issues;
  }

  async findOne(id: number): Promise<Issue | undefined> {
    // A manual span: what the auto-instrumentation of a real driver (pg, mysql2,
    // mongodb, prisma…) would create on its own.
    return Sentry.startSpan(
      { name: 'issues.repository.findOne', op: 'db.query', attributes: { 'issue.id': id } },
      () => this.read(id),
    );
  }

  private async read(id: number): Promise<Issue | undefined> {
    if (BROKEN_SHARD.has(id)) {
      throw new DatabaseError('Database connection lost', 'ECONNRESET');
    }
    return this.issues.find((issue) => issue.id === id);
  }

  async create(input: NewIssue): Promise<Issue> {
    const issue: Issue = {
      id: Math.max(...this.issues.map((i) => i.id)) + 1,
      title: input.title,
      status: 'open',
      assignee: null,
      priority: input.priority ?? 2,
    };
    this.issues.push(issue);
    return issue;
  }

  async purgeClosed(olderThanDays: number): Promise<number> {
    if (!Number.isFinite(olderThanDays) || olderThanDays < 0) {
      throw new DatabaseError('Purge refused: invalid retention', 'EINVAL');
    }
    return this.issues.filter((issue) => issue.status === 'closed').length;
  }
}
