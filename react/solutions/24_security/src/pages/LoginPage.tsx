import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { safeRedirect } from '../auth/guards';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await login(String(form.get('username')), String(form.get('password')));
      // `replace`: "Back" must not return to the login form.
      navigate(safeRedirect(searchParams.get('redirectTo')), { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Login failed');
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="login-title">
      <h1 id="login-title">Log in</h1>
      <form onSubmit={handleSubmit} className="login">
        <label>
          Username
          <input name="username" autoComplete="username" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="hint">Try luke / usetheforce (user) or leia / rebellion (admin).</p>
    </section>
  );
}
