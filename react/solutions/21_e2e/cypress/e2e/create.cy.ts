describe('creating a person', () => {
  beforeEach(() => {
    cy.resetApi();
    cy.intercept('POST', '/api/people').as('createPerson');
    cy.visit('/create');
  });

  it('refuses an empty name, without calling the API', () => {
    cy.getByRole('button', { name: 'Create' }).click();

    cy.getByRole('alert', { native: false }).should('have.text', 'Name is required');
    cy.getByRole('textbox', { name: 'Name' }).should('have.attr', 'aria-invalid', 'true');
    // `.all` holds every request matched by the alias: none was sent.
    cy.get('@createPerson.all').should('have.length', 0);
  });

  it('sends the form to the API, then shows the new person — who is now in the list', () => {
    cy.getByRole('textbox', { name: 'Name' }).type('Ahsoka Tano');
    cy.getByRole('textbox', { name: 'Height (cm)' }).type('170');
    cy.getByRole('combobox', { name: 'Gender' }).select('Female');
    cy.getByRole('button', { name: 'Create' }).click();

    cy.wait('@createPerson').then(({ request, response }) => {
      expect(request.body).to.deep.equal({ name: 'Ahsoka Tano', height: '170', gender: 'female' });
      expect(response?.statusCode).to.eq(201);
    });
    cy.location('pathname').should('match', /^\/people\/\d+$/);
    cy.getByRole('heading', { name: 'Ahsoka Tano' }).should('be.visible');

    cy.getByRole('link', { name: 'People' }).click();
    cy.get('tbody tr').should('have.length', 7).last().should('contain', 'Ahsoka Tano');
  });

  it('keeps the form, with an error, when the API refuses it', () => {
    cy.intercept('POST', '/api/people', { statusCode: 500, body: {} }).as('createPerson');

    cy.getByRole('textbox', { name: 'Name' }).type('Jar Jar Binks');
    cy.getByRole('button', { name: 'Create' }).click();

    cy.wait('@createPerson');
    cy.getByRole('alert', { native: false }).should('contain', 'could not be created');
    cy.location('pathname').should('eq', '/create');
    cy.getByRole('textbox', { name: 'Name' }).should('have.value', 'Jar Jar Binks');
  });
});
