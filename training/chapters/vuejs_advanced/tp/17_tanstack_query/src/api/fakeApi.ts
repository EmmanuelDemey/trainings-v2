import { reactive } from 'vue';

/**
 * An in-memory issue tracker. Every call is slow on purpose and written down in
 * `apiLog`, so the number of requests the app sends is something you can SEE —
 * in the Network panel of the page, and in the specs.
 */

export type IssueStatus = 'open' | 'closed';
export type IssueFilter = IssueStatus | 'all';

export interface Issue {
  id: number;
  title: string;
  status: IssueStatus;
}

const SEED: readonly Issue[] = [
  { id: 1, title: 'Checkout button does nothing on Safari', status: 'open' },
  { id: 2, title: 'Invoice PDF shows the wrong VAT rate', status: 'open' },
  { id: 3, title: 'Search ignores accented characters', status: 'open' },
  { id: 4, title: 'Dark mode flashes white on load', status: 'closed' },
  { id: 5, title: 'Password reset email lands in spam', status: 'closed' },
];

let issues: Issue[] = SEED.map((issue) => ({ ...issue }));
let nextId = SEED.length + 1;

/** Every request the "server" received, in order: `GET /issues?status=open`… */
export const apiLog = reactive<string[]>([]);

/** Round-trip time of every call. The specs lower it; the page keeps it visible. */
export const apiSettings = { latencyMs: 400 };

/** Tick it on the page (or flip it from the console) to make the server refuse status changes. */
export const failureSwitch = reactive({ status: false });

/** Puts the server back in its initial state — the specs call it before each test. */
export function resetApi(): void {
  issues = SEED.map((issue) => ({ ...issue }));
  nextId = SEED.length + 1;
  apiLog.splice(0, apiLog.length);
  failureSwitch.status = false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** What goes over the wire is a copy: nothing the client does can edit the server. */
function copy<T>(value: T): T {
  return structuredClone(value);
}

/*
 * Each call grabs the table BEFORE its delay: a request still in flight when
 * `resetApi()` runs lands in the old table, never in the next test's one.
 */

export async function fetchIssues(filter: IssueFilter): Promise<Issue[]> {
  const table = issues;
  apiLog.push(`GET /issues?status=${filter}`);
  await delay(apiSettings.latencyMs);
  return copy(filter === 'all' ? table : table.filter((issue) => issue.status === filter));
}

export async function createIssue(title: string): Promise<Issue> {
  const table = issues;
  apiLog.push('POST /issues');
  await delay(apiSettings.latencyMs);
  if (title.trim() === '') throw new Error('A title is required');

  const issue: Issue = { id: nextId++, title: title.trim(), status: 'open' };
  table.push(issue);
  return copy(issue);
}

export async function setIssueStatus(id: number, status: IssueStatus): Promise<Issue> {
  const table = issues;
  apiLog.push(`PATCH /issues/${id}`);
  await delay(apiSettings.latencyMs);
  if (failureSwitch.status) throw new Error('The issue tracker refused the change');

  const issue = table.find((candidate) => candidate.id === id);
  if (!issue) throw new Error(`Issue #${id} does not exist`);
  issue.status = status;
  return copy(issue);
}
