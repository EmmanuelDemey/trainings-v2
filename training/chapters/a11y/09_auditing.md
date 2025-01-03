---
layout: cover
---

# Evaluation

---

# Evaluation

- Evaluation Automatique
- Evaluation Manuelle

---

# Evaluation automatique

- Outils que nous pouvons utiliser :
  - Validateur du W3C
  - Les Devtools de Firefox ou Chrome
  - Lighthouse (basé sur Axe-core)
  - Librairies de Qualité (**testing-library** ou **eslint**)
  - Axe-core
  - Playwright
  - Puppeteer

---

# Devtools Chrome

- Les Devtools de Chrome propose une solution permettant
  - d'émuler les différentes déficiences aux couleurs.
  - de vérifier le contraste de votre contenu

---

# ESlint

- Dans l'ecosysyème ESlint, le plugin **eslint-plugin-jsx-a11y** permet de détecter des erreurs d'accessibilité dans une application React (ou Preact).

```shell
npm i eslint-plugin-jsx-a11y
```

```typescript
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  jsxA11y.flatConfigs.recommended,
  {
    // Your additional configs and overrides
  },
];
```

- Exemple de règles :
  - **alt-text**
  - **aria-props**
  - **aria-role**
  - **html-has-lang**
  - **iimg-redundant-alt**
  - ...

---

# Testing Library

- **Testing Library** est un ensemble de librairie utilisée pour écrire des tests unitaires
- Supporte plusieurs framework (React, Vue, ...)
- Met à disposition des méthodes permettant de sélectionne un élémént par sonrôle sémantique.
- Cette pratique invite à ecrire du code HTML sémantique

```typescript
it("should show a required field warning for each empty input field", async () => {
  const { user } = renderApp();
  await user.click(
    screen.getByRole("button", {
      name: "Login",
    })
  );

  expect(await screen.findByText("User Name Required")).toBeVisible();

  expect(await screen.findByText("Password Required")).toBeVisible();
});
```

---

# Axe - CLI

```shell
npm i -g axe-cli
axe https://google.com
```

---

# Axe

- Vous pouvez utiliser de différentes façons
  - via une extension Chrome
  - via des tests end2end (Selenium ou Cypress)
  - ou en ligne de commande

---

# Axe - Chrome extension

![Lens](/images/a11y/axe-screenshot.png)

---

# Playwright

- Solution permettant d'écrire des tests _End-to-end_
- Possibilité de faire des tests cross-platformes (Chrome, Edge, Firefox)
- Propose un *matcher* `toMatchAriaSnapshot`
- Systèmes de plugins disponibles
- Dont le plugin `@axe-core/playwright`

---

# Axe - toMatchAriaSnapshot

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright"; // 1

test.describe("homepage", () => {
  // 2
  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("https://your-site.com/"); // 3

    await expect(page.getByLabel("Main Navigation")).toMatchAriaSnapshot(`
      - navigation: "Main Navigation"
        - link "Home"
        - link "Login"
    `)
  });
});
```

---

# Axe - Playwright

```shell
npm init playwright@latest
npm i -D @axe-core/playwright
```

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright"; // 1

test.describe("homepage", () => {
  // 2
  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("https://your-site.com/"); // 3

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze(); // 4

    expect(accessibilityScanResults.violations).toEqual([]); // 5

    /**
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#navigation-menu-flyout')
      .analyze();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    */
  });
});
```

---

# Puppeteer

- Nous pouvons également créer des scripts Puppetter afin de générer des screenshots pour chaque version de votre application.

```javascript
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://android.com");

  await page.emulateVisionDeficiency("blurredVision");
  await page.screenshot({ path: "blurred-vision.png" });
  await browser.close();
})();
```

---

# Autres solutions

- Eslint Plugin JSX A11Y (https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- jest-axe (https://github.com/nickcolley/jest-axe)
- a11y.css (https://ffoodd.github.io/a11y.css)
- @accesslint/voiceover (https://www.npmjs.com/package/@accesslint/voiceover)

---

# Evaluation manuelle

- Vérifiez
  - que l'arbre d'accessibilité est optimal (via les DevTools de Chrome)
  - la présence du `Skip Link`
  - que tous les éléments intéractives sont atteignables au clavier
  - que seuls les éléments visibles sont atteignables au clavier
  - Les attributs `aria` ajoutés dynamiquement

---

# Evaluation manuelle

- La dernière étape consiste à faire un audit avec l'aide d'une personne ayant un handicap.

---
layout: cover
---

# PW
