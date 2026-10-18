describe('the people list', () => {
  beforeEach(() => {
    cy.resetApi();
    // A spy, not a stub: the real fake API answers, and the alias lets the test
    // wait for that answer instead of guessing how long it takes.
    cy.intercept('GET', '/api/people').as('getPeople');
  });

  it('lists the people of the API', () => {
    cy.visit('/');
    cy.wait('@getPeople').its('response.statusCode').should('eq', 200);

    // `getByRole` is built into Cypress 16: the accessible role and name, as in
    // Testing Library. A data row is a `row` with a `cell`; the header row has
    // `columnheader`s.
    cy.getByRole('table').find('tbody tr').should('have.length', 6);
    cy.getByRole('row', { name: /Darth Vader/ }).should('contain', '41.9BBY');
  });

  it('filters by name, and keeps the filter in the URL across a reload', () => {
    cy.visit('/');
    cy.wait('@getPeople');

    cy.getByRole('searchbox', { name: 'Filter by name' }).type('sky');

    cy.get('tbody tr').should('have.length', 1).and('contain', 'Luke Skywalker');
    cy.location('search').should('eq', '?q=sky');

    cy.reload();
    cy.wait('@getPeople');
    cy.getByRole('searchbox', { name: 'Filter by name' }).should('have.value', 'sky');
    cy.get('tbody tr').should('have.length', 1);
  });

  it('says so when nobody matches the filter', () => {
    cy.visit('/?q=yoda');
    cy.wait('@getPeople');

    cy.getByRole('table').should('not.exist');
    // `<p role="status">`: no HTML element has that role natively.
    cy.getByRole('status', { native: false }).should('have.text', 'No people match “yoda”.');
  });

  it('renders whatever the API returns — here, a fixture', () => {
    cy.intercept('GET', '/api/people', { fixture: 'two-people.json' }).as('getPeople');

    cy.visit('/');
    cy.wait('@getPeople');

    cy.get('tbody tr').should('have.length', 2);
    cy.getByRole('link', { name: 'Grogu' }).should('be.visible');
  });

  it('shows the error page, inside the layout, when the API fails', () => {
    cy.intercept('GET', '/api/people', { statusCode: 500, body: { message: 'The Death Star is down' } }).as(
      'getPeople',
    );

    cy.visit('/');
    cy.wait('@getPeople');

    cy.getByRole('alert', { native: false })
      .should('contain', 'Something went wrong')
      .and('contain', 'The Death Star is down');
    cy.getByRole('navigation', { name: 'Main' }).should('be.visible');
  });
});
