import type { CurrentUser } from '../auth';

interface HeaderProps {
  readonly user: CurrentUser | null;
  readonly onLogin: () => void;
  readonly onLogout: () => void;
}

export function Header({ user, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <h1>Issue tracker</h1>
      {user ? (
        <div className="row">
          <span data-testid="current-user">{user.name}</span>
          <button data-testid="logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      ) : (
        <button data-testid="login" onClick={onLogin}>
          Log in as Ada
        </button>
      )}
    </header>
  );
}
