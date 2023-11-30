# Cypress

- Cypress est une solution permettant d'écrire des tests d'intégration
- Facilite l'écriture de ces tests via une interface graphique
- Nécessite que le site testé soit accessible avant de lancer les tests

```shell
npm install -D cypress

cypress run
cypress open
```

---

# Cypress

```javascript
context("Home Page", () => {
  it("Should display the title", () => {
    cy.visit("http://localhost:3000/");

    cy.get("h1").contains("Title");
  });
});
```

---

# Cypress

- Création de scripts dans le `package.json`

```json
{
  "scripts": {
    "cypress": "NODE_ENV=production cypress open",
    "cypress:ci": "NODE_ENV=production cypress run"
  }
}
```
