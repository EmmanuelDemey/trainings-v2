---
layout: cover
---

# Evaluation

---

# Evaluation

- Automated evaluation
- Manual evaluation

---

# Automated evaluation

- Tools we can use:
  - W3C validator
  - Firefox or Chrome DevTools
  - Lighthouse (based on Axe-core)
  - Quality libraries (**testing-library** or **eslint**)
  - Axe-core
  - Playwright
  - Puppeteer

---

# Chrome DevTools

- Chrome DevTools offer a way to
  - emulate the various color vision deficiencies.
  - check the contrast of your content

---

# ESlint

- In the ESlint ecosystem, the **eslint-plugin-jsx-a11y** plugin detects accessibility errors in a React (or Preact) application.

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

- Example rules:
  - **alt-text**
  - **aria-props**
  - **aria-role**
  - **html-has-lang**
  - **img-redundant-alt**
  - ...

---

# Testing Library

- **Testing Library** is a set of libraries used to write unit tests
- Supports several frameworks (React, Vue, ...)
- Provides methods to select an element by its semantic role.
- This practice encourages writing semantic HTML

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

- You can use it in different ways
  - via a Chrome extension
  - via end-to-end tests (Selenium or Cypress)
  - or from the command line

---

# Axe - Chrome extension

![Lens](/images/a11y/axe-screenshot.png)

---

# Playwright

- A solution to write _End-to-end_ tests
- Cross-browser testing (Chrome, Edge, Firefox)
- Provides a `toMatchAriaSnapshot` *matcher*
- Plugin system available
- Including the `@axe-core/playwright` plugin

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

- We can also write Puppeteer scripts to generate screenshots for each version of your application.

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

# Other solutions

- Eslint Plugin JSX A11Y (https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- jest-axe (https://github.com/nickcolley/jest-axe)
- a11y.css (https://ffoodd.github.io/a11y.css)
- @accesslint/voiceover (https://www.npmjs.com/package/@accesslint/voiceover)

---

# Manual evaluation

- Check
  - that the accessibility tree is optimal (via Chrome DevTools)
  - that a `Skip Link` is present
  - that all interactive elements are reachable with the keyboard
  - that only visible elements are reachable with the keyboard
  - the dynamically added `aria` attributes

---

# Manual evaluation

- The last step is to run an audit with the help of a person with a disability.

---
layout: cover
---

# Workshop

Workshop 8: automated audit with axe
