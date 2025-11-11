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
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
# page transition
transition: slide-left
# use UnoCSS
css: unocss
---

# 🧪 Formation Vitest avec Vue.js

# Introduction à Vitest

---

# Pourquoi tester ? Pourquoi Vitest ?

- Garantir la fiabilité du code
- Éviter les régressions
- Faciliter le refactoring
- Documentation vivante du comportement attendu
- Renforce la confiance dans les livraisons

---

# Avantages de Vitest

- Compatible avec l'écosystème Vite
- Exécution ultra-rapide grâce à Vite + esbuild
- Syntaxe inspirée de Jest
- Support des tests unitaires, composants, snapshots, etc.
- Intégration native avec TypeScript
- Prise en charge des modules ESM, mocks, timers, coverage…

---

# Installation

---

# Création du projet Vue

```bash
npm create vue@latest
# ou
yarn create vue
```

- Sélectionner l'intégration Vite
- Activer TypeScript si besoin
- Choisir le framework de tests plus tard (on installe Vitest manuellement)

---

# Installation des dépendances

```bash
npm install -D vitest vue-test-utils @testing-library/vue
```

- `vitest` : moteur de test
- `@testing-library/vue` : outils pour tester les composants Vue
- `vue-test-utils` (optionnel selon approche)

---

# Configuration

---

# vitest.config.ts

```ts
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src"],
    //exclude: ['documentation/**/*.ts']
  },
});
```

- `globals: true` permet d’éviter les imports manuels de `describe`, `it`, etc.
- `jsdom`, `happydom` simule un DOM pour les tests Vue
- Possibilité d'exécuter les tests directement dans un navigateur : `browser mode`

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    browser: {
      provider: "playwright", // or 'webdriverio'
      enabled: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
```

---

# Vitest UI

- Interface Web permettant d'intéragit avec nos tests

```
npm i -D @vitest/ui

vitest --ui
```

---

# Structures recommandées

```
src/
├── components/
├── composables/
├── ...
tests/
├── unit/
├── integration/
vitest.config.ts
```

- `tests/unit/` : tests des fonctions pures, composants isolés
- `tests/integration/` : tests combinant plusieurs briques
- Possibilité d'utiliser les extensions `.spec.ts` ou `.test.ts`

```
src/
├── TaskItem.vue
├── TaskItem.test.ts
```

---

## layout: cover

# Tester les fonctions métier

---

# Structure des tests

- Un test doit exprimer un comportement attendu
- Utilisation des blocs : `describe`, `it` ou `test`
- Les assertions permettent de valider les résultats

---

# describe, it, expect

```ts
describe("addTask", () => {
  it("ajoute une tâche à la liste", () => {
    const tasks = [];
    const newTask = { id: 1, title: "Lire un livre" };
    addTask(tasks, newTask);
    expect(tasks).toContainEqual(newTask);
  });
});
```

- `describe` regroupe les cas de test
- `it` (ou `test`) décrit un cas de test unique
- `expect` permet d’exprimer des attentes
- `it.skip(...)`, `it.only(...)` ou `it.todo(...)`

---

# Types d’assertions

- `toBe(value)` : égalité stricte
- `toEqual(obj)` : égalité de structure
- `toContain`, `toContainEqual`
- `toBeTruthy`, `toBeFalsy`
- `toThrow`, `toHaveLength`, etc.

---

# Exemples courants

```ts
expect(sum(2, 2)).toBe(4);
expect([1, 2, 3]).toContain(2);
expect({ foo: "bar" }).toEqual({ foo: "bar" });
expect(() => doSomething()).toThrow();
```

- Préférer des tests simples, lisibles et explicites
- Un seul `expect` par test si possible

---

## Table Driven Tests

```ts
import {isValidEmail} from './validators';

describe('isValidEmail', () => {
  const testCases: {
    name: string;
    input: string;
    expected: boolean;
  }[] = [
    {
      name: 'email is empty',
      input: '',
      expected: false,
    },
  ];

  test.each(testCases)('$name', ({input, expected}) => {
    const result = isValidEmail(input);
    expect(result).toBe(expected);
  });
});
```

---

## layout: cover

# Async, mocks et espions

---

# Tester de l’async

- Tester des fonctions asynchrones avec `async/await`
- Utiliser `await` dans les tests pour attendre le résultat
- Gérer les erreurs avec `try/catch` ou `expect().rejects`

```ts
it("renvoie les données", async () => {
  const data = await fetchData();
  expect(data).toEqual({ id: 1 });
});
```

---

# Promesses, `resolves`, `rejects`

```ts
// Promesse résolue
await expect(fetchData()).resolves.toEqual({ id: 1 });

// Promesse rejetée
await expect(fetchData()).rejects.toThrow("Erreur API");
```

- `resolves` permet de tester une promesse réussie
- `rejects` permet de tester une promesse échouée

---

# Mocker une fonction

- `vi.fn()` permet de créer une fonction factice
- On peut définir le comportement avec `mockReturnValue`, `mockImplementation`
- Utile pour simuler des appels API, callbacks, etc.

```ts
const mock = vi.fn().mockReturnValue(42);
expect(mock()).toBe(42);
```

---

# vi.fn, vi.spyOn

- `vi.fn()` : crée une fonction factice
- `vi.spyOn(obj, 'method')` : espionne une méthode réelle

```ts
const logger = { log: () => {} };
const spy = vi.spyOn(logger, "log");
logger.log("test");
expect(spy).toHaveBeenCalledWith("test");
```

---

# Timers et Date

- Utiliser des fonctions avec délai (setTimeout, debounce, etc.)
- Pour les tester, on contrôle le temps avec `vi.useFakeTimers`

---

# vi.useFakeTimers

```ts
vi.useFakeTimers();

it("attend 1 seconde", () => {
  const fn = vi.fn();
  setTimeout(fn, 1000);

  vi.advanceTimersByTime(1000);
  expect(fn).toHaveBeenCalled();
});
```

- `vi.useFakeTimers()` remplace les fonctions natives de temporisation
- `vi.advanceTimersByTime(ms)` pour simuler l’écoulement du temps

---

## layout: cover

# Tester un composant Vue

---

# Utilisation de @testing-library/vue

- Fournit des outils pour tester des composants Vue comme un utilisateur final
- Méthode principale : `render(Component, options)`
- Utilise un DOM simulé via jsdom

```ts
import { render } from "@testing-library/vue";
import TaskItem from "@/components/TaskItem.vue";

render(TaskItem, {
  props: {
    task: { id: 1, title: "Apprendre Vitest", done: false },
  },
});
```

---

# Rendu et props

- `render()` permet de monter un composant
- On peut passer :
  - `props`
  - `slots`
  - `global.plugins`, `global.provide`

```ts
render(TaskItem, {
  props: { task: myTask },
});
```

---

# Sélectionner et interagir

- Les queries disponibles imitent les actions d’un utilisateur :
  - `getByText`, `getByRole`, `getByLabelText`, etc.
- Pour simuler une interaction : `fireEvent`

---

# getByText, fireEvent

```ts
const { getByText } = render(TaskItem, {
  props: { task: { title: "Faire les courses", done: false } },
});

const checkbox = getByText("Faire les courses");
expect(checkbox).toBeInTheDocument();

await fireEvent.click(checkbox);
```

- `fireEvent` permet de simuler les clics, saisies, etc.

---

# Assertions DOM

- Fournies par `@testing-library/jest-dom`
- S’utilisent avec `expect()`

```ts
expect(getByText("Tâche")).toBeVisible();
expect(getByRole("checkbox")).not.toBeChecked();
```

---

# Visibilité, état, contenu

- Exemples courants :

```ts
expect(getByText("OK")).toBeVisible();
expect(getByRole("button")).toBeDisabled();
expect(getByText("Erreur")).toHaveTextContent("Erreur");
```

- Favoriser des tests basés sur l’expérience utilisateur

---

## layout: cover

# Tester les hooks et le store

---

# Composition API et hooks

- Les "composables" sont des fonctions réutilisables utilisant la Composition API
- Ils encapsulent de la logique métier ou d'état (ex: `useTasks`, `useCounter`)
- Testables sans DOM : ils retournent des `ref`, `computed`, fonctions

```ts
export function useCounter() {
  const count = ref(0);
  const inc = () => count.value++;
  return { count, inc };
}
```

---

# Composables Vue

- Convention : préfixer par `use` (ex: `useAuth`, `useCart`)
- Les composables peuvent utiliser :

  - des `ref`, `reactive`, `computed`
  - des watchers
  - d’autres composables

- Avantage : testabilité isolée = logique testée sans dépendre d’un composant

---

# Tester un composable

- Tester directement le résultat retourné par la fonction
- Accéder aux `ref`, appeler les méthodes, observer les effets

```ts
import { useCounter } from "@/composables/useCounter";

test("incrémente le compteur", () => {
  const { count, inc } = useCounter();
  expect(count.value).toBe(0);
  inc();
  expect(count.value).toBe(1);
});
```

- Pas besoin de `render()`, juste exécuter la fonction et observer le comportement

---

# Cas pratiques

- Exemples de cas intéressants à tester :

  - `useTasks()` : ajouter, supprimer, basculer une tâche
  - `useDarkMode()` : basculer un thème avec `watch` sur `prefers-color-scheme`
  - `useFetch()` : mocker une requête `fetch` interne

- Bonnes pratiques :
  - Initialiser l’état de départ
  - Mocker les dépendances externes si besoin
  - Tester les effets visibles (résultat, mutation d’état)

---

## layout: cover

# Snapshots & couverture de code

---

# Snapshots

- Permettent de capturer une sortie HTML/JS/JSON à un instant donné
- Très utile pour :
  - du markup généré
  - des objets complexes
  - des composants statiques

```ts
expect(wrapper.html()).toMatchSnapshot();
```

- À l’exécution suivante, la sortie est comparée au fichier `.snap`

---

# Quand les utiliser

✅ Bon usage :

- Markup statique (ex: composant d'UI figé)
- Valeur complexe d’un objet ou d’un JSON

🚫 Mauvais usage :

- Données qui changent souvent (dates, IDs)
- Comportements dynamiques
- Trop de dépendance aux détails d’implémentation

⚠️ Un snapshot modifié doit être **revérifié manuellement**

---

# Couverture de code

- Active avec l’option `--coverage`

```bash
vitest run --coverage
```

- Permet d’identifier les fonctions, branches et fichiers non testés
- Génère un rapport complet dans le dossier `coverage/`
- Il est nécessaire d'installer un module supplémentaire : `@vitest/coverage-istanbul` ou `@vitest/coverage-v8` (recommandé)

---

# Rapport de couverture

- Fichiers générés dans `coverage/` :

  - HTML : visualisation graphique
  - JSON : export machine
  - lcov : pour intégration CI/CD

- Lancer un navigateur sur le fichier :

```bash
open coverage/index.html
```

- Objectif courant : **80 à 90 %** de couverture, sans tomber dans l’obsession du chiffre

---

## Autres options de la CLI

```
vitest run --changed=HEAD~1
```

---

## layout: cover

# Bonnes pratiques & CI

---

# Structuration

- Organiser les tests par type :
  - `tests/unit` pour les fonctions et composants isolés
  - `tests/integration` pour les scénarios plus larges
- Utiliser un nommage clair et explicite
- Grouper les tests avec `describe()` pour les contextualiser

---

# Nommer, organiser, isoler

- Nommer les fichiers en fonction de ce qu’ils testent :
  - `TaskItem.test.ts`, `useTasks.spec.ts`
- Un test = un comportement métier
- Isoler les effets de bord :
  - Nettoyer après chaque test (`afterEach`)
  - Réinitialiser les mocks (`vi.resetAllMocks()`)

---

# CI minimale

- Automatiser les tests à chaque push ou pull request
- Installer les dépendances + lancer les tests

```bash
npm ci
npm run test
```

- S’assurer que l’environnement est reproductible

---

# GitHub Actions ou autre CI

Exemple de workflow simple :

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  vitest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test -- --coverage
```

- Possibilité d’ajouter des badges, des notifications ou des seuils de couverture

---

## layout: cover

# Conclusion

---

# Récapitulatif des acquis

- Installer et configurer Vitest dans un projet Vue
- Écrire des tests unitaires et de composants
- Utiliser `@testing-library/vue` pour tester l’interface utilisateur
- Mocker des fonctions, gérer les cas asynchrones
- Couvrir les hooks et la logique métier
- Générer des rapports de couverture
- Intégrer les tests dans une CI (ex : GitHub Actions)

---

# Étapes suivantes

- Intégrer progressivement des tests sur un projet réel
- Ajouter des seuils de couverture dans la CI
- Former les équipes à la culture du test
- Explorer des tests end-to-end avec Playwright ou Cypress

📘 Ressources :

- https://vitest.dev
- https://testing-library.com/docs/vue-testing-library/intro/
- https://jestjs.io/docs/expect
