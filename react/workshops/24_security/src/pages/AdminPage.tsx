import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { getJson } from '../api/http';

export async function adminLoader({ request }: LoaderFunctionArgs) {
  // TODO 3.4: `await requireRole(request, 'admin')`.
  return getJson<{ people: number; accounts: number }>('/api/admin/stats', request.signal);
}

export function AdminPage() {
  const stats = useLoaderData<typeof adminLoader>();
  return (
    <section aria-labelledby="admin-title">
      <h1 id="admin-title">Administration</h1>
      <dl>
        <dt>People</dt>
        <dd>{stats.people}</dd>
        <dt>Accounts</dt>
        <dd>{stats.accounts}</dd>
      </dl>
    </section>
  );
}
