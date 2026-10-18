describe('a person page', () => {
  beforeEach(() => {
    cy.resetApi();
  });

  it('opens from the list, then goes back to the filtered list', () => {
    cy.intercept('GET', '/api/people/4').as('getVader');
    cy.visit('/?q=vader');

    cy.getByRole('link', { name: 'Darth Vader' }).click();

    cy.wait('@getVader');
    cy.location('pathname').should('eq', '/people/4');
    cy.getByRole('heading', { name: 'Darth Vader' }).should('be.visible');
    cy.contains('dd', '202 cm').should('be.visible');

    cy.go('back');
    cy.location('search').should('eq', '?q=vader');
    cy.get('tbody tr').should('have.length', 1);
  });

  it('shows a person created through the API', () => {
    cy.seedPerson({ name: 'Ahsoka Tano', height: '170' }).then((ahsoka) => {
      cy.visit(`/people/${ahsoka.id}`);
    });

    cy.getByRole('heading', { name: 'Ahsoka Tano' }).should('be.visible');
    cy.contains('dd', '170 cm').should('be.visible');
  });

  it('shows "Person not found" for an unknown id', () => {
    cy.visit('/people/999');

    cy.getByRole('heading', { name: 'Not found' }).should('be.visible');
    cy.contains('Person not found').should('be.visible');
  });

  it('shows the loading state while the person is on its way', () => {
    // Hold the response until the test has seen the loading state: deterministic,
    // where a real delay would be a race.
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    cy.intercept('GET', '/api/people/1', (request) => held.then(() => request.continue())).as('getLuke');
    cy.visit('/');

    cy.getByRole('link', { name: 'Luke Skywalker' }).click();

    cy.getByRole('status', { native: false })
      .should('have.text', 'Loading…')
      .then(() => release());
    cy.wait('@getLuke');
    cy.getByRole('heading', { name: 'Luke Skywalker' }).should('be.visible');
    cy.getByRole('status', { native: false }).should('not.exist');
  });
});
