describe('creating a person', () => {
  beforeEach(() => {
    cy.resetApi();
    // TODO 4.4: spy on POST /api/people (alias 'createPerson'), then visit '/create'.
  });

  it('refuses an empty name, without calling the API', () => {
    // TODO 4.5: submit the empty form — the alert, `aria-invalid` on Name, and
    // ZERO requests in '@createPerson.all'.
    throw new Error('TODO 4.5');
  });

  it('sends the form to the API, then shows the new person — who is now in the list', () => {
    // TODO 4.6: fill Name, Height (cm), Gender; submit; assert the request body
    // and the 201; land on /people/<id>; the list now has 7 rows.
    throw new Error('TODO 4.6');
  });

  it('keeps the form, with an error, when the API refuses it', () => {
    // TODO 5.4: stub the POST with a 500 — the alert, still on /create, the
    // typed name still in the field.
    throw new Error('TODO 5.4');
  });
});
