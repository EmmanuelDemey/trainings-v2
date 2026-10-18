describe('a person page', () => {
  beforeEach(() => {
    cy.resetApi();
  });

  it('opens from the list, then goes back to the filtered list', () => {
    // TODO 4.1: from '/?q=vader', click Darth Vader: /people/4, his heading,
    // "202 cm". Then `cy.go('back')`: the filtered list again.
    throw new Error('TODO 4.1');
  });

  it('shows a person created through the API', () => {
    // TODO 4.2: `cy.seedPerson(...)`, then visit the page of the person it yields.
    throw new Error('TODO 4.2');
  });

  it('shows "Person not found" for an unknown id', () => {
    // TODO 4.3: visit '/people/999'.
    throw new Error('TODO 4.3');
  });

  it('shows the loading state while the person is on its way', () => {
    // TODO 5.3 (bonus): hold the GET /api/people/1 response in a `cy.intercept`
    // handler until the "Loading…" status has been seen.
    throw new Error('TODO 5.3 (bonus)');
  });
});
