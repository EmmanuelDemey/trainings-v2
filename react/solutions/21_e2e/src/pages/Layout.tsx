import { NavLink, Outlet, useNavigation } from 'react-router';

export function Layout() {
  const navigation = useNavigation();

  return (
    <>
      <header>
        <h1>Star Wars people</h1>
        <nav aria-label="Main">
          <NavLink to="/" end>
            People
          </NavLink>
          <NavLink to="/create">Create a person</NavLink>
        </nav>
      </header>
      <main>
        {navigation.state === 'loading' && <p role="status">Loading…</p>}
        <Outlet />
      </main>
    </>
  );
}
