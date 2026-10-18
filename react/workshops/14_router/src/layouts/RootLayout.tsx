export function RootLayout() {
  return (
    <>
      <header>
        <strong>Star Wars people</strong>
        <nav aria-label="Main">
          {/* TODO 1.2: plain <a> reload the whole page. Use <NavLink> from
              'react-router' — and think about `end` on the "/" one. */}
          <a href="/">People</a>
          <a href="/create">Create a person</a>
        </nav>
      </header>
      <main>{/* TODO 1.3: the matching child route renders here: <Outlet />. */}</main>
    </>
  );
}
