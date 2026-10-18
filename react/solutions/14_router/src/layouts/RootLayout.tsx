import { NavLink, Outlet } from 'react-router';

export function RootLayout() {
  return (
    <>
      <header>
        <strong>Star Wars people</strong>
        <nav aria-label="Main">
          {/* `end`: without it, "/" would match — and be active — on every page. */}
          <NavLink to="/" end>
            People
          </NavLink>
          <NavLink to="/create">Create a person</NavLink>
        </nav>
      </header>
      <main>
        {/* Where the matching child route renders. */}
        <Outlet />
      </main>
    </>
  );
}
