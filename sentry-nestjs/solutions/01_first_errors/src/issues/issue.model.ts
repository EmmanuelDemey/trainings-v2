export type IssueStatus = 'open' | 'closed';

export interface Issue {
  id: number;
  title: string;
  status: IssueStatus;
  assignee: string | null;
  priority: 1 | 2 | 3;
}

export interface NewIssue {
  title: string;
  priority?: 1 | 2 | 3;
}
