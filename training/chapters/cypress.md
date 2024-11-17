# Cypress

- Cypress est une solution permettant d'écrire des tests *end to end*
- Solution similaire à **Playwright** ou encore **Selenium**
- Facilite l'écriture de ces tests via une interface graphique
- Est capable de lancer les tests sur différents navigateurs
- Nécessite que le site testé soit accessible avant de lancer les tests

```shell
npm install -D cypress

cypress run
cypress open
```

---

# Cypress

```javascript
describe('Auth', () => {
  it('user should be able to log in', () => {
    cy.visit('http://localhost:3000/')

    // open the login modal
    cy.get('button').contains('Login').click()

    // fill in the form
    cy.get('input[type="email"]').type('test@test.com')
    cy.get('input[type="password"]').type('test123')

    // submit the form 
    cy.get('button').contains('Sign in').click()
    cy.contains('button', 'Logout').should('be.visible')
  })
})
```

---

# Cypress

- Création de scripts dans le **package.json**

```json
{
  "scripts": {
    "cypress": "NODE_ENV=production cypress open",
    "cypress:ci": "NODE_ENV=production cypress run"
  }
}
```
