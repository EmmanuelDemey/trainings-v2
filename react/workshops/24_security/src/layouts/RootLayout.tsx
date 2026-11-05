import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';

export function RootLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <header>
        <strong>Star Wars people</strong>
        <nav aria-label="Main">
          {user && (
            <NavLink to="/" end>
              People
            </NavLink>
          )}
          {/* TODO 3.5: only for an admin. Hiding the link is UX: the loader and
              the API do the protecting. */}
          <NavLink to="/admin">Admin</NavLink>
        </nav>
        {user ? (
          <span className="user">
            {/* Text: React escapes it, even if the name contains markup. */}
            Logged in as {user.name}{' '}
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </span>
        ) : (
          <NavLink to="/login">Log in</NavLink>
        )}
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
