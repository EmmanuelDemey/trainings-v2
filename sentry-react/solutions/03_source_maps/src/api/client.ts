import { API_URL, AVATARS_URL, type Issue, type IssueStatus } from './fakeServer';

export type Filter = IssueStatus | 'all';
export type IssueSummary = Pick<Issue, 'id' | 'title' | 'status'>;

/**
 * A request the API answered with an error status. `route` is the route
 * TEMPLATE (`/issues/:id`), not the URL: the same bug on two issues is one bug.
 */
export class ApiError extends Error {
  override name = 'ApiError';

  constructor(
    readonly method: string,
    readonly path: string,
    readonly route: string,
    readonly status: number,
  ) {
    super(`${method} ${path} → ${status}`);
  }
}

async function get<T>(path: string, route: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new ApiError('GET', path, route, response.status);
  return (await response.json()) as T;
}

export const fetchIssues = (filter: Filter) => get<IssueSummary[]>(`/issues?status=${filter}`, '/issues');

export const fetchIssue = (id: number) => get<Issue>(`/issues/${id}`, '/issues/:id');

export const fetchHealth = () => get<{ status: string }>('/health', '/health');

export async function fetchAvatar(login: string): Promise<{ initials: string }> {
  const response = await fetch(`${AVATARS_URL}/v1/${login}`);
  return (await response.json()) as { initials: string };
}
