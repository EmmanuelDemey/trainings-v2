---
layout: cover
---

# 6 - Tests avec Node.js

---

# Pyramide des tests

```
        /\
       /e2e\         ← Cypress / Playwright
      /------\
     /  intg  \      ← supertest, testcontainers
    /----------\
   /   unit     \    ← Mocha, Jest, node:test
  /--------------\
```

- **Unitaires** : rapides, nombreux, isolés
- **Intégration** : valident la collaboration de plusieurs modules
- **End-to-end** : valident le parcours utilisateur via un navigateur

---

# Le runner natif `node:test`

- Disponible depuis Node.js 18, stable en 20
- Pas besoin de dépendances externes

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');

test('addition', () => {
  assert.equal(1 + 1, 2);
});

test('groupe', async (t) => {
  await t.test('cas 1', () => assert.ok(true));
  await t.test('cas 2', () => assert.ok(true));
});
```

```bash
node --test
node --test --watch
```

---

# Mocha

- Runner historique, très flexible
- BDD-style (`describe` / `it`) ou TDD-style

```javascript
const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');

describe('Calculator', () => {
  let calc;
  beforeEach(() => { calc = new Calculator(); });

  it('additionne deux nombres', () => {
    expect(calc.add(1, 2)).to.equal(3);
  });
});
```

- Nécessite une lib d'assertion (`chai`, `node:assert`) et une lib de mocks (`sinon`)

---

# Jest

- Tout-en-un : runner + assertions + mocks + couverture
- Très utilisé côté frontend, très productif

```javascript
describe('Calculator', () => {
  it('additionne deux nombres', () => {
    expect(new Calculator().add(1, 2)).toBe(3);
  });
});
```

```bash
jest --coverage --watch
```

- Inconvénient : transpileur intégré (Babel) parfois lourd, moins rapide que Vitest

---

# Tests asynchrones

- Toutes les libs supportent les Promises ; il suffit de retourner ou `await` la promise

```javascript
it('fetch user', async () => {
  const user = await api.getUser(1);
  expect(user.id).toBe(1);
});
```

- Pour tester un timeout

```javascript
it('rejette après 1s', async () => {
  await expect(slowOp()).rejects.toThrow('Timeout');
});
```

- Avec `node:test`, le timeout est configurable via `t.test(name, { timeout: 5000 }, ...)`

---

# Mocks et stubs

- **Stub** : remplace une fonction par une version contrôlée
- **Mock** : stub avec assertions sur les appels (paramètres, nombre, ordre)
- **Spy** : observe sans modifier

```javascript
// Jest
jest.spyOn(repo, 'save').mockResolvedValue({ id: 1 });

const order = await service.create(payload);

expect(repo.save).toHaveBeenCalledWith(payload);
```

```javascript
// node:test (Node 20+)
const { mock } = require('node:test');
const fn = mock.fn(() => 42);
fn();
console.log(fn.mock.calls.length); // 1
```

---

# Mocking de modules

```javascript
// Jest
jest.mock('./repo', () => ({ save: jest.fn() }));

// node:test (à partir de Node 22)
mock.module('./repo.js', { namedExports: { save: () => ({ id: 1 }) } });
```

- Pour mocker `fetch`, on peut utiliser `nock`, `msw` ou `undici.MockAgent`

---

# Isolation des tests

- Chaque test doit pouvoir s'exécuter **seul**, dans **n'importe quel ordre**
- Pas d'état global partagé : nettoyer dans `afterEach`
- Base de données :
  - Transactions rollback
  - Conteneurs éphémères (`testcontainers`)
  - Schémas par worker

```javascript
beforeEach(async () => {
  await db.migrate.latest();
});

afterEach(async () => {
  await db.migrate.rollback();
});
```

---

# Tests d'intégration HTTP

- **`supertest`** : envoie des requêtes à un serveur Express en mémoire

```javascript
const request = require('supertest');
const app = require('../app');

it('GET /health', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});
```

---

# Tests fonctionnels avec headless browsers

- **Playwright** : multi-navigateur (Chromium, Firefox, WebKit), API moderne, auto-wait
- **Puppeteer** : centré Chromium, plus ancien
- **Cypress** : DX éprouvée, mais limité à un seul navigateur par session

```javascript
const { test, expect } = require('@playwright/test');

test('login', async ({ page }) => {
  await page.goto('https://app.sparks.fr/login');
  await page.fill('#email', 'manu@sparks.fr');
  await page.fill('#password', 'secret');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/dashboard/);
});
```

---

# Couverture de code

- `c8` (V8 native) ou `nyc` (Istanbul)

```bash
c8 --reporter=lcov --reporter=text node --test
```

- Métriques : lines, statements, branches, functions
- Ne pas viser **100%** mais une couverture **utile** sur la logique métier

---

# Bonnes pratiques

- **Arrange / Act / Assert** dans chaque test
- Un test = **une** assertion logique
- Nommer les tests sous forme de **comportement** (`should reject when ...`)
- Lancer la suite sur la **CI** à chaque PR
- Mesurer le temps des tests et **paralléliser** quand possible

---
layout: cover
---

# Travaux Pratiques

## Atelier 6 - Tests
- Écrire des tests unitaires d'un service avec mocks de repository
- Tester une route Express avec `supertest`
- Écrire un test e2e Playwright sur une page `/login`
