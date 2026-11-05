/**
 * The fake backend of the workshops: the issue tracker API and the avatars CDN,
 * served in the browser by replacing `fetch`. Nothing to start, nothing to
 * install — and every request is written down in `serverLog`, headers included,
 * so the specs can check what the app (and the Sentry SDK) sent.
 *
 * `main.tsx` installs it BEFORE `initSentry()`: the SDK's fetch instrumentation
 * then wraps this fake, exactly as it wraps the real `fetch` in production.
 *
 * Bugs on purpose:
 *   - issue 7 has `assignee: null`, though the API contract says it never is
 *   - GET /issues/13 and GET /issues/14 answer 500
 *   - an unknown issue (e.g. 99) answers 404
 */

export const API_URL = 'https://api.issue-tracker.test';
export const AVATARS_URL = 'https://avatars.issue-tracker-cdn.test';

export type IssueStatus = 'open' | 'closed';

export interface Assignee {
  login: string;
  name: string;
}

export interface Issue {
  id: number;
  title: string;
  status: IssueStatus;
  description: string;
  assignee: Assignee;
}

export interface LoggedRequest {
  method: string;
  url: string;
  /** Lower-cased header names. */
  headers: Record<string, string>;
}

export const serverSettings = {
  /** How long every answer takes. The specs set it to 0. */
  latencyMs: 300,
};

/** Every request the fake backend received, in order. */
export const serverLog: LoggedRequest[] = [];

const TITLES = [
  'Checkout button does nothing on Safari',
  'Dark mode resets after reload',
  'Search ignores accents',
  'Export to CSV truncates long titles',
  'Avatar upload fails above 2 MB',
  'Notifications arrive twice',
  'Issue detail crashes when unassigned',
  'Date picker starts on Sunday in France',
  'Pagination skips the last page',
  'Markdown tables render without borders',
  'Session expires while typing a comment',
  'Labels are sorted case-sensitively',
  'Database timeout on the activity feed',
  'Webhook retries never stop',
  'Keyboard shortcuts clash with the browser',
  'Copy link copies the wrong URL',
  'Mentions do not autocomplete',
  'Drafts are lost on navigation',
  'Emoji picker is cut off on mobile',
  'Sort by priority puts urgent last',
];

const PEOPLE: Assignee[] = [
  { login: 'ada', name: 'Ada Lovelace' },
  { login: 'grace', name: 'Grace Hopper' },
  { login: 'linus', name: 'Linus Torvalds' },
];

function seed(): Issue[] {
  return TITLES.map((title, index) => {
    const id = index + 1;
    return {
      id,
      title,
      status: id % 3 === 0 ? 'closed' : 'open',
      description: `Steps to reproduce issue #${id}, and what was expected instead.`,
      // The bug of issue 7: the API contract says an issue always has an assignee.
      assignee: (id === 7 ? null : PEOPLE[id % PEOPLE.length]) as Assignee,
    };
  });
}

const issues = seed();

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function answerApi(method: string, url: URL): Response {
  const path = url.pathname;
  if (method === 'GET' && path === '/health') return json(200, { status: 'ok' });

  if (method === 'GET' && path === '/issues') {
    const status = url.searchParams.get('status') ?? 'open';
    const list = issues
      .filter((issue) => status === 'all' || issue.status === status)
      .map(({ id, title, status }) => ({ id, title, status }));
    return json(200, list);
  }

  const match = /^\/issues\/(\d+)$/.exec(path);
  if (method === 'GET' && match) {
    const id = Number(match[1]);
    if (id === 13 || id === 14) return json(500, { message: 'Internal Server Error' });
    const issue = issues.find((candidate) => candidate.id === id);
    return issue ? json(200, issue) : json(404, { message: `Issue ${id} not found` });
  }

  return json(404, { message: `No route for ${method} ${path}` });
}

function answerAvatars(method: string, url: URL): Response {
  const match = /^\/v1\/([a-z]+)$/.exec(url.pathname);
  if (method !== 'GET' || !match) return json(404, { message: 'Unknown avatar' });
  const person = PEOPLE.find((candidate) => candidate.login === match[1]);
  const initials = person ? person.name.split(' ').map((part) => part[0]).join('') : '?';
  return json(200, { login: match[1], initials });
}

let installed = false;

/** Replaces `fetch` for the API and the CDN; every other URL goes to the real `fetch`. */
export function installFakeServer(): void {
  if (installed) return;
  installed = true;
  const realFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    const isApi = url.origin === API_URL;
    const isCdn = url.origin === AVATARS_URL;
    if (!isApi && !isCdn) return realFetch(input, init);

    const headers: Record<string, string> = {};
    request.headers.forEach((value, name) => {
      headers[name.toLowerCase()] = value;
    });
    serverLog.push({ method: request.method, url: request.url, headers });

    if (serverSettings.latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, serverSettings.latencyMs));
    return isApi ? answerApi(request.method, url) : answerAvatars(request.method, url);
  };
}

/** Forgets the requests received so far — the specs call it before each test. */
export function resetServer(): void {
  serverLog.length = 0;
}
