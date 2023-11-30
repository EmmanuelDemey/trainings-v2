# Playwright

- Playwright est une solution permettant d'écrire des tests d'intégration
- Facilite l'écriture de ces tests via une interface graphique
- Nécessite que le site testé soit accessible avant de lancer les tests

```shell
npm install -D @playwright/test

npx playwright test
npx playwright test --ui
```

---

# Cypress

```javascript
import {test, expect, Page, Locator} from '@playwright/test';

class LoginPage {
  constructor(private page: Page) { }

  fillEmailInput(email: string){
    return this.page.getByPlaceholder('Nom.Prénom@heyliot.app').fill(email);
  }

  fillPasswordInput(email: string){
    return this.page.getByPlaceholder('Saisir votre mot de passe').fill(email);
  }

  async clickSubmit(){
    await expect(this.page.getByRole("button", { name: "Se connecter"})).toBeEnabled();
    return this.page.getByRole("button", { name: "Se connecter"}).click();
  }
}

test(' Connexion  KO', async ({ page }) => {
  await page.goto('/');
  const loginPage = new LoginPage(page);
  await loginPage.fillEmailInput("email@email.com")
  await loginPage.fillPasswordInput("password")
  await loginPage.clickSubmit();
  await expect(page.getByText("L'utilisateur n'existe pas ou votre mot de passe est erroné")).toBeVisible();
});

```

---

# Cypress

- Création de scripts dans le `package.json`

```json
{
  "scripts": {
    "cypress:run": "playwright test --ui",
    "cypress:ci": "playwright test"
  }
}
```
