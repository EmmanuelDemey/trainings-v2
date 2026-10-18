describe('the people list', () => {
  beforeEach(() => {
    cy.resetApi();
    // TODO 3.1: spy on GET /api/people with `cy.intercept`, aliased 'getPeople'.
  });

  it('lists the people of the API', () => {
    // TODO 3.2: visit '/', wait for '@getPeople' (a 200), expect 6 data rows,
    // and Darth Vader's row to show 41.9BBY.
    throw new Error('TODO 3.2');
  });

  it('filters by name, and keeps the filter in the URL across a reload', () => {
    // TODO 3.3: type 'sky' in the "Filter by name" searchbox — one row left,
    // Luke's, and `?q=sky` in the URL. Reload: the filter is still there.
    throw new Error('TODO 3.3');
  });

  it('says so when nobody matches the filter', () => {
    // TODO 3.5: visit '/?q=yoda' — no table, and the status message.
    throw new Error('TODO 3.5');
  });

  it('renders whatever the API returns — here, a fixture', () => {
    // TODO 5.1: stub GET /api/people with cypress/fixtures/two-people.json.
    throw new Error('TODO 5.1');
  });

  it('shows the error page, inside the layout, when the API fails', () => {
    // TODO 5.2: stub GET /api/people with a 500 — the alert shows, the nav stays.
    throw new Error('TODO 5.2');
  });
});
