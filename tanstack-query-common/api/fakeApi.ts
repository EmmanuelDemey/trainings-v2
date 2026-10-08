/**
 * An in-memory issue tracker, shared by the React, Angular and Vue workshops.
 *
 * Every call is slow on purpose and written down in `apiLog`, so the number of
 * requests the app sends is something you can SEE — in the Network panel at the
 * bottom of the page, and in the specs.
 *
 * Framework-agnostic on purpose: no React, no Angular, no Vue in here. The
 * Network panel and the specs listen with `onApiChange()`.
 */

export type IssueStatus = 'open' | 'closed';
export type IssueFilter = IssueStatus | 'all';

/** What a list returns: enough for a row, not for the detail page. */
export interface IssueSummary {
  id: number;
  title: string;
  status: IssueStatus;
  assignee: string | null;
  commentCount: number;
}

/** What `GET /issues/:id` returns: the summary, plus what only the detail shows. */
export interface Issue extends IssueSummary {
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssuePatch {
  title?: string;
  status?: IssueStatus;
  assignee?: string | null;
}

/** A numbered page: `GET /issues?page=2`. */
export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** A cursor page: `GET /activity?cursor=10`. `nextCursor` is `null` on the last one. */
export interface CursorPage<T> {
  items: T[];
  nextCursor: number | null;
}

export interface Activity {
  id: number;
  message: string;
  at: string;
}

/** The error every failing call rejects with: an HTTP status, and a message to show. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/* ------------------------------------------------------------------------- */
/* The data                                                                   */
/* ------------------------------------------------------------------------- */

const TITLES = [
  'Checkout button does nothing on Safari',
  'Invoice PDF shows the wrong VAT rate',
  'Search ignores accented characters',
  'Dark mode flashes white on load',
  'Password reset email lands in spam',
  'Cart badge keeps the old count after logout',
  'Date picker starts the week on Sunday',
  'Export to CSV drops the last row',
  'Avatar upload accepts 40 MB files',
  'Session expires while typing a long comment',
  'Filters reset when coming back from a detail page',
  'Notifications are sent twice on mobile',
  'Order history is sorted oldest first',
  'Coupon field accepts expired codes',
  'Keyboard focus is lost after closing the modal',
  'Totals are rounded twice',
  'Product images are blurry on retina screens',
  'Tooltip hides the submit button',
  'Shipping estimate ignores public holidays',
  'Language switcher forgets the choice on reload',
  'Infinite spinner when the API is offline',
  'Screen reader announces the price twice',
  'Wishlist cannot be shared',
  'Signup form allows an empty last name',
  'Map does not load behind the corporate proxy',
  'Back button leaves the checkout funnel',
  'Phone numbers are not formatted',
  'Stock count is wrong after a refund',
  'Footer links open in the same tab',
  'Gift cards cannot be combined',
  'Breadcrumb shows the category id instead of its name',
  'Pagination skips page 2 on slow networks',
  'Review stars are not clickable on touch devices',
  'Error page has no way back home',
  'Address autocomplete suggests other countries',
  'Two-factor code field rejects pasted codes',
  'Newsletter checkbox is ticked by default',
  'Price filter slider jumps by 100',
  'Return label is generated in the wrong language',
  'Cookie banner reappears on every page',
  'Loyalty points are credited twice',
  'Delivery slot picker shows past slots',
] as const;

const ASSIGNEES = ['Ada', 'Grace', 'Linus', null] as const;

/** A fixed point in time: the same data on every machine, every run. */
const T0 = Date.UTC(2026, 0, 5, 9, 0, 0);
const HOUR = 3_600_000;

function seedIssues(): Issue[] {
  return TITLES.map((title, index) => {
    const id = index + 1;
    const createdAt = new Date(T0 + id * 7 * HOUR).toISOString();
    return {
      id,
      title,
      // Every third issue is closed: 28 open, 14 closed.
      status: id % 3 === 0 ? 'closed' : 'open',
      assignee: ASSIGNEES[id % ASSIGNEES.length] ?? null,
      commentCount: (id * 7) % 5,
      description: `Reported by the support team. Steps to reproduce, expected and actual behaviour of "${title}".`,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

const VERBS = ['opened', 'commented on', 'closed', 'assigned', 'renamed', 'reopened'] as const;

function seedActivity(): Activity[] {
  // 34 events, newest first: three full pages of 10, and a last one of 4.
  return Array.from({ length: 34 }, (_, index) => {
    const id = 34 - index;
    const verb = VERBS[id % VERBS.length] ?? 'opened';
    const who = ASSIGNEES[id % 3] ?? 'Ada';
    const issueId = ((id * 5) % TITLES.length) + 1;
    return {
      id,
      message: `${who} ${verb} issue #${issueId}`,
      at: new Date(T0 + 400 * HOUR + id * HOUR).toISOString(),
    };
  });
}

let issues: Issue[] = seedIssues();
let activity: Activity[] = seedActivity();
let nextIssueId = issues.length + 1;
let nextActivityId = activity.length + 1;

/* ------------------------------------------------------------------------- */
/* The instruments: the log, the settings, and who listens to them             */
/* ------------------------------------------------------------------------- */

export interface ApiCall {
  /** `GET /issues?status=open`, `PATCH /issues/3`… — what the specs count. */
  label: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  state: 'pending' | 'done' | 'failed';
  startedAt: number;
  endedAt: number | null;
}

/** Every request the "server" received, in order. */
export const apiLog: ApiCall[] = [];

/**
 * How the server behaves. The page changes it through the Network panel; the
 * specs change it directly.
 */
export const apiSettings = {
  /** Round-trip time of every call. */
  latencyMs: 400,
  /** Every POST, PATCH and DELETE fails with a 500. */
  failWrites: false,
  /** The next request, whatever it is, fails with a 503 — then this goes back to false. */
  failNextRequest: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

/** Called after every change of the log or of the data. Returns the unsubscribe function. */
export function onApiChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  for (const listener of listeners) listener();
}

/** How many times the server received `label`, whatever came of it. */
export function sent(label: string): number {
  return apiLog.filter((call) => call.label === label).length;
}

/** The requests still waiting for their answer — all of them, or only those for `label`. */
export function inFlight(label?: string): ApiCall[] {
  return apiLog.filter((call) => call.state === 'pending' && (label === undefined || call.label === label));
}

/** Empties the log, without touching the data. */
export function clearApiLog(): void {
  apiLog.splice(0, apiLog.length);
  notify();
}

/** Puts the server back in its initial state — the specs call it before each test. */
export function resetApi(): void {
  issues = seedIssues();
  activity = seedActivity();
  nextIssueId = issues.length + 1;
  nextActivityId = activity.length + 1;
  apiLog.splice(0, apiLog.length);
  apiSettings.latencyMs = 400;
  apiSettings.failWrites = false;
  apiSettings.failNextRequest = false;
  notify();
}

/**
 * Someone else, in another tab, closes the first open issue. The app is NOT
 * told: no request of the app is involved. Only a refetch can show it.
 */
export function simulateExternalChange(): IssueSummary | null {
  const issue = issues.find((candidate) => candidate.status === 'open');
  if (!issue) return null;
  issue.status = 'closed';
  issue.updatedAt = new Date().toISOString();
  record(`Grace closed issue #${issue.id}`);
  notify();
  return summaryOf(issue);
}

/* ------------------------------------------------------------------------- */
/* The endpoints                                                              */
/* ------------------------------------------------------------------------- */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** What goes over the wire is a copy: nothing the client does can edit the server. */
function copy<T>(value: T): T {
  return structuredClone(value);
}

function summaryOf(issue: Issue): IssueSummary {
  const { id, title, status, assignee, commentCount } = issue;
  return { id, title, status, assignee, commentCount };
}

function record(message: string): void {
  activity.unshift({ id: nextActivityId++, message, at: new Date().toISOString() });
}

/**
 * Logs the call, waits, decides whether it fails, then runs `handler`. The
 * tables are read AFTER the delay, but `resetApi()` swaps them for new ones: a
 * request still in flight when a spec resets the server answers from the new
 * tables, never mutates the old ones a later spec could see.
 */
async function request<T>(method: ApiCall['method'], path: string, handler: () => T): Promise<T> {
  const call: ApiCall = { label: `${method} ${path}`, method, state: 'pending', startedAt: Date.now(), endedAt: null };
  apiLog.push(call);
  notify();

  const failNow = apiSettings.failNextRequest;
  apiSettings.failNextRequest = false;

  await delay(apiSettings.latencyMs);

  try {
    if (failNow) throw new ApiError(503, 'The server is temporarily unavailable');
    if (method !== 'GET' && apiSettings.failWrites) {
      throw new ApiError(500, 'The issue tracker refused the change');
    }
    const result = copy(handler());
    call.state = 'done';
    return result;
  } catch (error) {
    call.state = 'failed';
    throw error;
  } finally {
    call.endedAt = Date.now();
    notify();
  }
}

function findIssue(id: number): Issue {
  const issue = issues.find((candidate) => candidate.id === id);
  if (!issue) throw new ApiError(404, `Issue #${id} does not exist`);
  return issue;
}

/** `GET /issues?status=open` — every issue of a status, oldest first. */
export function fetchIssues(filter: IssueFilter = 'all'): Promise<IssueSummary[]> {
  return request('GET', `/issues?status=${filter}`, () =>
    issues.filter((issue) => filter === 'all' || issue.status === filter).map(summaryOf),
  );
}

/** `GET /issues?page=2` — every issue, `pageSize` at a time. Pages start at 1. */
export function fetchIssuePage(page: number, pageSize = 10): Promise<Page<IssueSummary>> {
  return request('GET', `/issues?page=${page}`, () => {
    const total = issues.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page < 1 || page > totalPages) throw new ApiError(404, `Page ${page} does not exist`);
    const items = issues.slice((page - 1) * pageSize, page * pageSize).map(summaryOf);
    return { items, page, pageSize, total, totalPages };
  });
}

/** `GET /issues/3` — one issue, with its description. */
export function fetchIssue(id: number): Promise<Issue> {
  return request('GET', `/issues/${id}`, () => findIssue(id));
}

/** `GET /activity?cursor=10` — the activity feed, newest first, `limit` events at a time. */
export function fetchActivity(cursor = 0, limit = 10): Promise<CursorPage<Activity>> {
  return request('GET', `/activity?cursor=${cursor}`, () => {
    const items = activity.slice(cursor, cursor + limit);
    const next = cursor + limit;
    return { items, nextCursor: next < activity.length ? next : null };
  });
}

/** `POST /issues` — a new open issue. A blank title is refused with a 400. */
export function createIssue(input: { title: string }): Promise<Issue> {
  return request('POST', '/issues', () => {
    const title = input.title.trim();
    if (title === '') throw new ApiError(400, 'A title is required');
    const now = new Date().toISOString();
    const issue: Issue = {
      id: nextIssueId++,
      title,
      status: 'open',
      assignee: null,
      commentCount: 0,
      description: '',
      createdAt: now,
      updatedAt: now,
    };
    issues.push(issue);
    record(`You opened issue #${issue.id}`);
    return issue;
  });
}

/** `PATCH /issues/3` — changes the title, the status or the assignee. */
export function updateIssue(id: number, patch: IssuePatch): Promise<Issue> {
  return request('PATCH', `/issues/${id}`, () => {
    const issue = findIssue(id);
    if (patch.title !== undefined) {
      const title = patch.title.trim();
      if (title === '') throw new ApiError(400, 'A title is required');
      issue.title = title;
    }
    if (patch.status !== undefined) issue.status = patch.status;
    if (patch.assignee !== undefined) issue.assignee = patch.assignee;
    issue.updatedAt = new Date().toISOString();
    record(`You updated issue #${id}`);
    return issue;
  });
}

/** `DELETE /issues/3`. */
export function deleteIssue(id: number): Promise<void> {
  return request('DELETE', `/issues/${id}`, () => {
    findIssue(id);
    issues = issues.filter((issue) => issue.id !== id);
    record(`You deleted issue #${id}`);
  });
}
