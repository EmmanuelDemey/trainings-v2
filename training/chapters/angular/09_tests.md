---
layout: cover
---

# Tests

---

# Tests Unitaires

- Pourquoi Jest et Testing Library ?

- Jest :

  - Framework de test JavaScript populaire.
  - Prise en charge de l'ensemble du cycle de vie du test.
  - Simple à configurer et à utiliser.

- Testing Library :
  - Met l'accent sur le test de comportement utilisateur.
  - Facilite la création de tests plus robustes et maintenables.
  - Encourage les tests orientés utilisateur.

```typescript
import { render } from "@testing-library/angular";
import { MyComponent } from "./my-component.component";

describe("MyComponent", () => {
  test("renders component with correct text", async () => {
    const { getByText } = await render(MyComponent);
    expect(getByText("Hello, World!")).toBeTruthy();
  });
});
```

---

# Tests E2E

- Historiquement, Angular proposait une intégration de **Protractor**
- **Protractor** est à présent déprécié, mais Angular propose des intégrations à des solutions connues
  - Cypress
  - Nightwatch
  - Playwright

```shell
npx @angular/cli e2e
```
