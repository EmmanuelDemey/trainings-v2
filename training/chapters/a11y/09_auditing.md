---
layout: cover
---

# Evaluation

---

# Evaluation

* Evaluation Automatique
* Evaluation Manuelle

---

# Evaluation automatique

* Outils que nous pouvons utiliser :
    * Validateur du W3C
    * Les Devtools de Firefox ou Chrome
    * Lighthouse (basé sur Axe-core)
    * Axe-core
    * Cypress Axe (basé sur Axe-core)
    * Puppeteer

---

# Devtools Chrome

* Les Devtools de Chrome propose une solution permettant
    * d'émuler les différentes déficiences aux couleurs.
    * de vérifier le contraste de votre contenu

---

# Axe - CLI

```shell
npm i -g axe-cli
axe https://google.com
```

---

# Axe

* Vous pouvez utiliser de différentes façons
    * via une extension Chrome
    * via des tests end2end (Selenium ou Cypress)
    * ou en ligne de commande

---

# Axe - Chrome extension

![Lens](/images/a11y/axe-screenshot.png)

---

# Cypress

* Solution permettant d'écrire des tests end2end
* Possibilité de faire des tests cross-platformes (Chrome, Edge, Firefox)
* Systèmes de plugins disponibles
* Dont le plugin `cypress-axe`

---

# Axe - Cypress

```shell
npm i -D cypress
./nodes_modules/.bin/cypress open
npm i -D cypress-axe axe-core
```

* Il faudra ensuite ajouter dans le fichier `cypress/support/index.js`

```javascript
import 'cypress-axe'
```

---

# Axe - Cypress

```javascript
beforeEach(() => {
  cy.visit('http://localhost:9000')
  cy.injectAxe();
  cy.checkA11y();
})
```

---

# Axe - Cypress

![Lens](/images/a11y/cypress.png)

---

# Puppeteer

* Nous pouvons également créer des scripts Puppetter afin de générer des screenshots pour chaque version de votre application.

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://android.com');

  await page.emulateVisionDeficiency('blurredVision');
  await page.screenshot({ path: 'blurred-vision.png' });
  await browser.close();
})();
```

---

# Autres solutions

* Eslint Plugin JSX A11Y (https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
* jest-axe (https://github.com/nickcolley/jest-axe)
* a11y.css (https://ffoodd.github.io/a11y.css)
* @accesslint/voiceover (https://www.npmjs.com/package/@accesslint/voiceover)

---

# Evaluation manuelle

* Vérifiez
    * que l'arbre d'accessibilité est optimal (via les DevTools de Chrome)
    * la présence du `Skip Link`
    * que tous les éléments intéractives sont atteignables au clavier
    * que seuls les éléments visibles sont atteignables au clavier
    * Les attributs `aria` ajoutés dynamiquement

---

# Evaluation manuelle

* La dernière étape consiste à faire un audit avec l'aide d'une personne ayant un handicap.

---
layout: cover
---

# PW