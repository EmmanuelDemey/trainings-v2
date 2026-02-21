---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: "text-center"
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Formation Vitest avec Vue.js
  Tests unitaires et d'intégration avec Vitest

  Learn more at [Vitest](https://vitest.dev)
# persist drawings in exports and build
drawings:
  persist: false
# page transition
transition: slide-left
# use UnoCSS
css: unocss
---

# 🧪 Formation Vitest avec Vue.js

Tests unitaires et d'intégration

---
layout: cover
---

# Questions préliminaires

---

# Questions importantes

- Horaires de la formation
- Présentation et tour de table
- Utilisez-vous **yarn** ou **npm** ?
- **TypeScript** ou **JavaScript** ?
- Les TP s'appliqueront sur votre propre application

---
layout: cover
---

# Rappels JavaScript/Node.js

---

# npm scripts

Les scripts npm permettent d'exécuter des commandes définies dans `package.json` :

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  }
}
```

```bash
npm run test
npm run test:ui
```

---

# npx

`npx` permet d'exécuter des binaires de packages npm sans installation globale :

```bash
# Exécute vitest sans l'installer globalement
npx vitest

# Crée un nouveau projet
npx create-vue@latest
```

- Utile pour tester des outils
- Garantit l'utilisation de la version locale du projet

---

# Modules ES6 vs CommonJS

**CommonJS** (Node.js classique) :

```js
// Export
module.exports = { sum };
// Import
const { sum } = require('./math');
```

**ES6 Modules** (moderne) :

```js
// Export
export const sum = (a, b) => a + b;
// Import
import { sum } from './math';
```

Vitest supporte nativement les **modules ES6**.

---

# Imports statiques et asynchrones

**Import statique** (au début du fichier) :

```ts
import { render } from '@testing-library/vue';
```

**Import dynamique** (asynchrone) :

```ts
const module = await import('./mon-module');
```

- Utile pour le lazy loading
- Utilisé avec `vi.doMock()` dans les tests

---

# Copie d'objets avec le spread operator

Le spread operator `...` permet de copier et modifier des objets :

```ts
const user = { name: 'Alice', age: 25 };

// Copie avec modification
const updatedUser = { ...user, age: 26 };

// Ajout de propriété
const userWithId = { ...user, id: 1 };
```

⚠️ **Attention** : copie superficielle uniquement (shallow copy)

---
layout: cover
---

# Introduction aux tests

---

# Pyramide des tests

```
        /\
       /  \      E2E Tests (peu nombreux, coûteux)
      /____\
     /      \    Tests d'intégration
    /________\
   /          \  Tests unitaires (nombreux, rapides)
  /__________\
```

- **Tests unitaires** : testent une fonction/composant isolé
- **Tests d'intégration** : testent plusieurs composants ensemble
- **Tests E2E** : testent l'application complète

---

# Fonctionnalités nécessaires

Pour un framework de tests moderne, on a besoin de :

- **Watch mode** : relance automatique des tests
- **Coverage** : couverture de code
- **Assertions** : vérification des résultats
- **Snapshot** : capture de l'état
- **Rapidité** : exécution rapide
- **Support TypeScript** : par défaut

---

# Écosystème existant

**Tests unitaires et d'intégration** :
- **Jest** : très populaire, mais plus lent
- **Vitest** : moderne, rapide, compatible Vite
- Karma : ancien, moins utilisé

**Tests d'interface graphique** :
- **Cypress** : tests E2E complets
- **Playwright** : moderne, multi-navigateurs

👉 **Notre choix** : **Vitest** pour sa vitesse et son intégration avec Vite

---
layout: cover
---

# Installation

---

# Créer un projet Vite et ajouter Vitest

```bash
# Créer un projet Vue avec Vite
npm create vue@latest
# ou
yarn create vue

cd mon-projet

# Installer Vitest
npm install -D vitest
```

---

# Ajouter les scripts dans package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  }
}
```

```bash
npm run test
```

---

# Extensions de fichiers

Vitest détecte automatiquement les fichiers de tests :

- `*.test.ts` ou `*.test.js`
- `*.spec.ts` ou `*.spec.js`

Configurable dans `vitest.config.ts` :

```ts
export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}']
  }
});
```

---

# Écrire un test simple

Créez un fichier `src/utils/sum.ts` :

```ts
export const sum = (a: number, b: number) => a + b;
```

Créez un fichier `src/utils/sum.test.ts` :

```ts
import { expect, test } from 'vitest';
import { sum } from './sum';

test('additionne 2 + 3 pour obtenir 5', () => {
  expect(sum(2, 3)).toBe(5);
});
```

---

# Présenter la CLI

Lancer les tests :

```bash
# Mode watch (relance automatique)
npm run test

# Mode CI (une seule exécution)
npm run test -- --run
# ou
CI=true npm run test
```

Options utiles :
- `--watch` : mode watch
- `--run` : exécution unique
- `--coverage` : génère le rapport de couverture
- `--ui` : interface graphique

---

# Plugin IDE

**VS Code** : extension officielle Vitest

- Rechercher "Vitest" dans les extensions
- Affiche les tests dans la sidebar
- Permet de lancer les tests directement depuis l'éditeur
- Affiche les erreurs inline

---

# Vitest UI

Interface Web interactive pour vos tests :

```bash
npm i -D @vitest/ui

# Lancer l'interface
npm run test:ui
```

Fonctionnalités :
- Visualisation graphique des tests
- Filtrage et recherche
- Reruns sélectifs
- Inspection détaillée des erreurs

---

# TP : Implémenter un test simple

**Objectif** : Créer un premier test dans votre codebase

1. Identifiez une fonction simple dans votre projet
2. Créez un fichier de test à côté (ex: `maFonction.test.ts`)
3. Écrivez un ou plusieurs cas de test
4. Lancez les tests avec `npm run test`

**Exemple** :
- Tester une fonction de validation
- Tester un calcul métier
- Tester une transformation de données

---
layout: cover
---

# Syntaxe des tests

---

# describe, it, test

Structure de base des tests :

```ts
import { describe, it, test, expect } from 'vitest';

describe('ma suite de tests', () => {
  it('cas de test 1', () => {
    expect(true).toBe(true);
  });

  test('cas de test 2', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- `describe` : groupe de tests
- `it` / `test` : cas de test individuel (synonymes)
- `expect` : assertion

---

# Modificateurs : concurrent, only, skip, todo

```ts
// Exécution parallèle
test.concurrent('test 1', async () => { /* ... */ });

// Exécuter uniquement ce test
test.only('test important', () => { /* ... */ });

// Ignorer ce test
test.skip('test à corriger', () => { /* ... */ });

// Test à implémenter
test.todo('test futur');

// Condition
test.skipIf(process.env.CI)('test local', () => { /* ... */ });
```

⚠️ Avec `CI=true`, un `only` fera échouer la suite de tests

---

# Modificateur fail

Inverser le résultat attendu :

```ts
// Ce test passe si la fonction throw une erreur
test.fails('devrait échouer', () => {
  throw new Error('Expected error');
});

// Utile pour tester du code qui doit échouer
test.fails('validation incorrecte', () => {
  validateEmail('invalid');
});
```

---

# test.each : tests paramétrés

```ts
test.each([
  { a: 1, b: 1, expected: 2 },
  { a: 2, b: 2, expected: 4 },
  { a: 5, b: 3, expected: 8 },
])('$a + $b devrait être $expected', ({ a, b, expected }) => {
  expect(a + b).toBe(expected);
});
```

Alternative avec tableau :

```ts
test.each([
  [1, 1, 2],
  [2, 2, 4],
])('addition de %i + %i = %i', (a, b, expected) => {
  expect(a + b).toBe(expected);
});
```

---

# Options dans le second paramètre

Configuration avancée des tests :

```ts
test('test avec timeout personnalisé', () => {
  // ...
}, {
  timeout: 10000, // 10 secondes
  retry: 3, // Retry 3 fois en cas d'échec
  concurrent: true // Exécution parallèle
});
```

Également disponible pour `describe` :

```ts
describe('suite avec config', () => {
  // ...
}, {
  concurrent: true,
  timeout: 5000
});
```

---

# Attention CI=true

En mode CI, certains comportements changent :

```ts
// ❌ Ce test fera échouer la suite en CI
test.only('test isolé', () => {
  expect(true).toBe(true);
});
```

Variables d'environnement :

```bash
# Mode CI strict
CI=true npm run test

# Mode watch désactivé automatiquement en CI
npm run test -- --run
```

---

# Coverage (couverture de code)

```bash
# Installer le plugin de couverture
npm i -D @vitest/coverage-v8

# Générer le rapport
npm run coverage
```

Configuration dans `vitest.config.ts` :

```ts
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'html', 'json'],
      exclude: ['node_modules/', 'tests/'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

---

# In-source testing

Écrire les tests directement dans le fichier source :

```ts
// src/utils/sum.ts
export const sum = (a: number, b: number) => a + b;

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('additionne deux nombres', () => {
    expect(sum(2, 3)).toBe(5);
  });
}
```

Configuration :

```ts
export default defineConfig({
  test: {
    includeSource: ['src/**/*.ts']
  }
});
```

---

# Hooks : beforeEach, afterEach

```ts
describe('ma suite', () => {
  let context;

  beforeEach(() => {
    // Exécuté avant chaque test
    context = { user: null };
  });

  afterEach(() => {
    // Exécuté après chaque test
    context = null;
  });

  it('test 1', () => {
    context.user = { name: 'Alice' };
    expect(context.user.name).toBe('Alice');
  });

  it('test 2', () => {
    // context est réinitialisé
    expect(context.user).toBeNull();
  });
});
```

---

# Hooks : beforeAll, afterAll

```ts
describe('ma suite', () => {
  let database;

  beforeAll(async () => {
    // Exécuté une fois avant tous les tests
    database = await setupDatabase();
  });

  afterAll(async () => {
    // Exécuté une fois après tous les tests
    await database.close();
  });

  it('test 1', async () => {
    await database.insert({ id: 1 });
  });

  it('test 2', async () => {
    const data = await database.findById(1);
    expect(data).toBeDefined();
  });
});
```

---

# Assertions : syntaxe Jest

Vitest supporte la syntaxe Jest par défaut :

```ts
// Égalité
expect(2 + 2).toBe(4);
expect({ a: 1 }).toEqual({ a: 1 });

// Véracité
expect(true).toBeTruthy();
expect(false).toBeFalsy();

// Inclusion
expect([1, 2, 3]).toContain(2);
expect('hello').toContain('ell');

// Exceptions
expect(() => { throw new Error() }).toThrow();

// Longueur
expect([1, 2, 3]).toHaveLength(3);
```

---

# Assertions : syntaxe Chai (optionnelle)

Configuration pour utiliser Chai :

```ts
import { expect } from 'vitest';

// Style Chai
expect(value).to.equal(5);
expect(array).to.include(item);
expect(obj).to.have.property('key');
```

👉 Recommandation : **style Jest** (plus répandu dans l'écosystème)

---

# Test annotations avec TypeScript

```ts
import type { Task } from './types';

test('crée une tâche', () => {
  const task: Task = {
    id: 1,
    title: 'Test',
    completed: false
  };

  expect(task.id).toBe(1);
  expect(task.completed).toBe(false);
});
```

TypeScript garantit la cohérence des types dans les tests.

---

# TP : Manipuler ces principes dans des tests complexes

**Objectif** : Approfondir la syntaxe des tests

1. Créez une suite de tests avec `describe`
2. Utilisez `beforeEach` pour initialiser des données
3. Testez plusieurs cas avec `test.each`
4. Ajoutez un test à ignorer avec `skip`
5. Utilisez différentes assertions
6. Générez un rapport de couverture

---
layout: cover
---

# Extended matchers

---

# Fichier de setup

Créez un fichier `tests/setup.ts` :

```ts
import { expect } from 'vitest';

// Étendre les matchers
expect.extend({
  toBeEven(received: number) {
    const pass = received % 2 === 0;
    return {
      pass,
      message: () => `expected ${received} to be even`
    };
  }
});
```

Configuration dans `vitest.config.ts` :

```ts
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts']
  }
});
```

---

# Exemple de custom matcher

```ts
// tests/setup.ts
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`
    };
  }
});

// Dans un test
expect('test@example.com').toBeValidEmail();
```

---

# Déclaration TypeScript

Pour avoir l'autocomplétion, créez `tests/matchers.d.ts` :

```ts
interface CustomMatchers<R = unknown> {
  toBeEven(): R;
  toBeValidEmail(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
```

---

# TP : Implémenter un custom matcher

**Objectif** : Créer un matcher personnalisé

1. Créez un fichier `tests/setup.ts`
2. Implémentez un matcher utile pour votre domaine métier
   - Ex: `toBeValidPhoneNumber()`
   - Ex: `toBeInRange(min, max)`
   - Ex: `toHaveStatus(status)`
3. Ajoutez les déclarations TypeScript
4. Utilisez-le dans un test

---
layout: cover
---

# Snapshots

---

# File snapshot

Les snapshots capturent une sortie et la comparent lors des prochains tests :

```ts
test('génère le bon HTML', () => {
  const html = render(MyComponent);
  expect(html).toMatchSnapshot();
});
```

Premier run : crée `__snapshots__/mytest.spec.ts.snap`

```
exports[`génère le bon HTML 1`] = `
"<div class='container'>
  <h1>Hello</h1>
</div>"
`;
```

---

# Inline snapshot

Alternative sans fichier séparé :

```ts
test('génère le bon objet', () => {
  const data = { id: 1, name: 'Alice' };

  expect(data).toMatchInlineSnapshot(`
    {
      "id": 1,
      "name": "Alice"
    }
  `);
});
```

Le snapshot est directement dans le code.

---

# Mise à jour : -u

Quand le code change volontairement :

```bash
# Mettre à jour tous les snapshots
npm run test -- -u

# Mode interactif
npm run test -- --watch
# puis appuyer sur 'u' pour update
```

⚠️ **Vérifier manuellement** que le changement est intentionnel !

---
layout: cover
---

# Mocks

---

# vi.fn

Créer une fonction mock :

```ts
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn('hello');

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('hello');
expect(mockFn).toHaveBeenCalledTimes(1);

// Définir un retour
const mockAdd = vi.fn().mockReturnValue(42);
expect(mockAdd(1, 2)).toBe(42);

// Définir une implémentation
const mockSum = vi.fn((a, b) => a + b);
expect(mockSum(2, 3)).toBe(5);
```

---

# vi.spyOn

Espionner une méthode existante :

```ts
const obj = {
  method: () => 'original'
};

const spy = vi.spyOn(obj, 'method');

obj.method();
expect(spy).toHaveBeenCalled();

// Modifier le comportement
spy.mockReturnValue('mocked');
expect(obj.method()).toBe('mocked');

// Restaurer le comportement original
spy.mockRestore();
expect(obj.method()).toBe('original');
```

---

# vi.mock

Mocker un module entier :

```ts
import { vi } from 'vitest';

vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1, name: 'Alice' }))
}));

import { fetchUser } from './api';

test('récupère un utilisateur', async () => {
  const user = await fetchUser();
  expect(user.name).toBe('Alice');
});
```

⚠️ **Important** : `vi.mock()` doit être appelé **avant** l'import du module

---

# vi.mock avec spy: true

Pour mocker partiellement en gardant le comportement réel :

```ts
vi.mock('./api', { spy: true });

// Toutes les fonctions sont espionnées
// mais gardent leur implémentation réelle

import { fetchUser, saveUser } from './api';

test('espionne les appels', async () => {
  await fetchUser(1);
  expect(fetchUser).toHaveBeenCalledWith(1);

  // Le comportement réel est exécuté
});
```

---

# hoisted

Pour référencer des valeurs avant les imports :

```ts
import { vi } from 'vitest';

const mockApiUrl = vi.hoisted(() => 'http://test.local');

vi.mock('./config', () => ({
  API_URL: mockApiUrl()
}));

import { API_URL } from './config';

test('utilise l\'URL mockée', () => {
  expect(API_URL).toBe('http://test.local');
});
```

Le `vi.hoisted()` est nécessaire car les mocks sont hoistés au début du fichier.

---

# doMock et dynamic import

`vi.doMock()` permet de mocker dynamiquement :

```ts
test('mock dynamique', async () => {
  vi.doMock('./api', () => ({
    fetchUser: () => ({ id: 1 })
  }));

  const { fetchUser } = await import('./api');
  const user = await fetchUser();

  expect(user.id).toBe(1);
});

test('mock différent', async () => {
  vi.doMock('./api', () => ({
    fetchUser: () => ({ id: 2 })
  }));

  const { fetchUser } = await import('./api');
  const user = await fetchUser();

  expect(user.id).toBe(2);
});
```

---

# importActual

Importer le module réel dans un mock :

```ts
vi.mock('./api', async () => {
  const actual = await vi.importActual('./api');

  return {
    ...actual, // Garde toutes les vraies fonctions
    fetchUser: vi.fn(() => ({ id: 1 })) // Mock seulement fetchUser
  };
});

import { fetchUser, saveUser } from './api';

test('mock partiel', async () => {
  const user = await fetchUser();
  expect(user.id).toBe(1); // Mocké

  await saveUser(user); // Vrai comportement
});
```

---

# __mocks__

Convention pour créer des mocks réutilisables :

```
src/
  api/
    index.ts
  __mocks__/
    api/
      index.ts
```

```ts
// src/__mocks__/api/index.ts
import { vi } from 'vitest';

export const fetchUser = vi.fn(() => ({ id: 1, name: 'Alice' }));
export const saveUser = vi.fn();
```

```ts
// Dans un test
vi.mock('./api'); // Utilise automatiquement __mocks__/api/index.ts

import { fetchUser } from './api';
```

---
layout: cover
---

# Testing Library et Vue Testing Library

---

# Présentation de Testing Library

**Philosophy** : tester comme un utilisateur

- Rechercher par texte visible, rôle, label
- Éviter les détails d'implémentation
- Focus sur le comportement utilisateur

```bash
npm install -D @testing-library/vue @testing-library/user-event
```

Configuration requise :

```bash
npm install -D jsdom
```

---

# Configuration pour Vue Testing Library

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
```

---

# query* - Les différents types

**getBy*** : trouve un élément (erreur si absent)

```ts
const button = getByRole('button', { name: /submit/i });
// ❌ Erreur si non trouvé
```

**queryBy*** : trouve un élément (retourne null si absent)

```ts
const error = queryByText('Error');
expect(error).toBeNull(); // ✅ OK si absent
```

**findBy*** : trouve un élément de façon asynchrone

```ts
const message = await findByText('Success!');
// Attend jusqu'à 1000ms par défaut
```

---

# Queries courantes

```ts
import { render } from '@testing-library/vue';

const { getByText, getByRole, getByLabelText } = render(MyComponent);

// Par texte
getByText('Hello World');
getByText(/hello/i); // Insensible à la casse

// Par rôle (RECOMMANDÉ)
getByRole('button', { name: 'Submit' });
getByRole('textbox', { name: /email/i });

// Par label
getByLabelText('Email');

// Par test-id (dernier recours)
getByTestId('custom-element');
```

---

# user-event

Simulation d'interactions utilisateur réalistes :

```ts
import { render } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';

test('remplit un formulaire', async () => {
  const user = userEvent.setup();
  const { getByLabelText, getByRole } = render(LoginForm);

  await user.type(getByLabelText('Email'), 'test@example.com');
  await user.type(getByLabelText('Password'), 'secret123');
  await user.click(getByRole('button', { name: 'Login' }));

  // Assertions...
});
```

Plus réaliste que `fireEvent` car simule vraiment le comportement utilisateur.

---

# user-event : autres interactions

```ts
const user = userEvent.setup();

// Sélection dans un select
await user.selectOptions(getByRole('combobox'), 'value');

// Upload de fichier
const file = new File(['content'], 'test.txt', { type: 'text/plain' });
await user.upload(getByLabelText('File'), file);

// Hover
await user.hover(getByRole('button'));

// Keyboard
await user.keyboard('{Enter}');
await user.keyboard('{Shift>}A{/Shift}'); // Shift+A

// Clear input
await user.clear(getByRole('textbox'));
```

---

# debug

Outil pour inspecter le DOM pendant les tests :

```ts
import { render, screen } from '@testing-library/vue';

test('debug exemple', () => {
  const { debug } = render(MyComponent);

  // Affiche tout le DOM
  debug();

  // Affiche un élément spécifique
  const button = screen.getByText('Click me');
  debug(button);
});
```

Affiche le HTML formaté dans la console avec coloration syntaxique.

---

# Testing Playground

Outil interactif pour trouver les bonnes queries :

1. **Dans le navigateur** : https://testing-playground.com/
   - Copiez votre HTML
   - Le playground suggère les meilleures queries

2. **Dans le test** :

```ts
import { render, screen } from '@testing-library/vue';

const { container } = render(MyComponent);
screen.logTestingPlaygroundURL();
// Ouvre un lien vers le playground avec votre HTML
```

---
layout: cover
---

# Advanced

---

# extend test

Créer des utilitaires de test réutilisables :

```ts
// tests/utils.ts
import { test as base } from 'vitest';
import { createPinia } from 'pinia';

export const test = base.extend({
  pinia: async ({}, use) => {
    const pinia = createPinia();
    await use(pinia);
  }
});

// Dans un test
import { test } from './utils';

test('utilise le store', ({ pinia }) => {
  // pinia est disponible automatiquement
});
```

---

# Projets Vitest

Organiser plusieurs configurations de tests dans un seul fichier de config.

Un **projet** est un runner de tests séparé qui :
- Partage une configuration de base
- Surcharge les options spécifiques à son contexte

---

# Projets : cas d'usage

Les projets sont utiles pour :

- Séparer les **tests unitaires** des **tests d'intégration** (plus lents)
- Distinguer les tests en **browser mode** des tests classiques
- Isoler les tests **frontend** (composants) des tests **backend** (API)
- Utiliser des **environnements différents** (node, jsdom, happy-dom)
- Appliquer des **setup/teardown** distincts par catégorie de tests

---

# Projets : configuration de base

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.unit.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['**/*.integration.test.{ts,tsx}'],
        },
      },
    ],
  },
});
```

---

# Projets : extends

La propriété `extends: true` permet l'héritage de la configuration de base.

```ts
projects: [
  {
    extends: true, // hérite de globals, setupFiles, environment...
    test: {
      name: 'unit',
      include: ['**/*.unit.test.{ts,tsx}'],
    },
  },
]
```

Les options partagées comme `globals` et `environment` s'appliquent automatiquement à tous les projets.

⚠️ Sans `extends: true`, le projet démarre avec une configuration vierge.

---

# Projets : stratégies d'organisation

**Par suffixe de fichier** (recommandé) :

```
src/utils/sum.unit.test.ts
src/api/users.integration.test.ts
```

**Par répertoire** :

```
__tests__/unit/sum.test.ts
__tests__/integration/users.test.ts
```

**Par exclusion** : combiner `include` et `exclude` quand les tests partagent le même nom de base.

---

# Projets : scripts npm

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest --project unit",
    "test:integration": "vitest --project integration"
  }
}
```

```bash
# Lancer un seul projet
npx vitest --project unit

# Lancer plusieurs projets
npx vitest --project unit --project integration

# Lancer tous les projets
npx vitest
```

---

# Projets : intégration browser mode

Les projets permettent de combiner des tests classiques et browser mode :

```ts
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.unit.test.ts'],
          environment: 'jsdom',
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['**/*.browser.test.ts'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
```

---

# Projets : limitations

⚠️ **Coverage et reporters** doivent être définis dans la configuration racine :

```ts
export default defineConfig({
  test: {
    // ✅ Coverage au niveau racine
    coverage: {
      reporter: ['text', 'html'],
    },
    // ✅ Reporters au niveau racine
    reporters: ['default'],
    projects: [
      // ...
    ],
  },
});
```

Ces options ne peuvent pas être spécifiques à un projet sans utiliser des fichiers de configuration séparés.

---

# Projets : avantages

Pourquoi utiliser les projets plutôt que plusieurs fichiers de config ?

- **Un seul fichier** : tout est centralisé dans `vitest.config.ts`
- **CLI simplifiée** : pas besoin de `--config` différent par contexte
- **Exécution simultanée** : tous les projets tournent en parallèle avec `vitest`
- **Configuration partagée** : pas de duplication grâce à `extends: true`

---

# Browser mode

Exécuter les tests dans un vrai navigateur :

```bash
npm i -D @vitest/browser playwright
```

```ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      // ou
      // provider: 'webdriverio'
    }
  }
});
```

---

# Browser mode : cas d'usage

Utile pour :
- Tests de rendu exact (CSS, layout)
- APIs spécifiques au navigateur (localStorage, canvas, etc.)
- Interactions complexes (drag & drop, etc.)
- Tests de compatibilité multi-navigateurs

```ts
test('teste dans le navigateur', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const title = await page.textContent('h1');
  expect(title).toBe('Mon application');
});
```

---

# Benchmark

Comparer les performances de différentes implémentations :

```ts
import { bench, describe } from 'vitest';

describe('sorting algorithms', () => {
  bench('bubble sort', () => {
    bubbleSort([5, 3, 8, 1, 9]);
  });

  bench('quick sort', () => {
    quickSort([5, 3, 8, 1, 9]);
  });
});
```

```bash
npm run test -- --benchmark
```

---

# Benchmark : configuration

```ts
bench('my benchmark', () => {
  // code à mesurer
}, {
  time: 1000, // Durée en ms
  iterations: 100, // Nombre d'itérations
  warmup: true // Préchauffage
});
```

Résultat :

```
✓ bubble sort  1234 ops/sec ±1.23%
✓ quick sort   5678 ops/sec ±0.89% (fastest)
```

---

# Type testing

Tester les types TypeScript :

```ts
import { expectTypeOf } from 'vitest';

test('types', () => {
  expectTypeOf({ a: 1 }).toEqualTypeOf<{ a: number }>();

  expectTypeOf<string>().toBeString();
  expectTypeOf<number>().toBeNumber();

  const add = (a: number, b: number) => a + b;
  expectTypeOf(add).parameters.toEqualTypeOf<[number, number]>();
  expectTypeOf(add).returns.toBeNumber();
});
```

---

# Type testing : cas avancés

```ts
import { expectTypeOf } from 'vitest';

test('types avancés', () => {
  // Tester les génériques
  expectTypeOf<Array<string>>().toMatchTypeOf<Array<any>>();

  // Tester les unions
  type Status = 'pending' | 'success' | 'error';
  expectTypeOf<Status>().toEqualTypeOf<'pending' | 'success' | 'error'>();

  // Tester les propriétés
  type User = { id: number; name: string };
  expectTypeOf<User>().toHaveProperty('id');
  expectTypeOf<User>().toHaveProperty('name');
});
```

---
layout: cover
---

# Conclusion

---

# Récapitulatif

✅ Questions préliminaires et rappels JavaScript/Node.js
✅ Introduction à la pyramide des tests
✅ Installation et configuration de Vitest
✅ Syntaxe des tests : describe, it, expect
✅ Extended matchers personnalisés
✅ Snapshots pour capturer l'état
✅ Mocks et spies avec vi.*
✅ Testing Library pour tester comme un utilisateur
✅ Projets Vitest : organiser et séparer les configurations de tests
✅ Fonctionnalités avancées : browser mode, benchmarks, type testing

---

# Ressources

📘 **Documentation officielle** :
- https://vitest.dev
- https://testing-library.com/docs/vue-testing-library/intro/

📚 **Guides et articles** :
- https://vuejs.org/guide/scaling-up/testing.html
- https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

🎥 **Vidéos** :
- Vitest YouTube Channel
- Vue Mastery Testing Course

---
layout: end
---

# Merci !

Des questions ?
