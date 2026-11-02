# TypeScript — TODO mise à jour formation (2 jours)

État actuel : 11 chapitres (00 → 10), 10 TP autonomes, basé sur **TypeScript 7**,
**Node.js 24**, **Vitest 5** (`^7.0.2`, `^24.19.2`, `^5.0.5` dans les 20 `package.json`).
Déjà couvert : `erasableSyntaxOnly`, type stripping, `using`, `satisfies`, `NoInfer`,
`const` type params, décorateurs standard + metadata, `isolatedDeclarations`,
`rewriteRelativeImportExtensions`, `expectTypeOf`.

## 0. Global / transverse

- [ ] Monter `typescript`, `@types/node`, `vitest` à la dernière version dans
      `workshops/*` et `solutions/*`
- [ ] Relancer `workshops.ci.mjs` : starters rouges, solutions vertes
- [ ] Vérifier `.nvmrc` (24) vs Node LTS du moment
- [ ] Vérifier chaque TP dans StackBlitz (le playground tourne-t-il avec TS 7 natif ?)
- [ ] `workshops/09_modules/dist` et `workshops/10_tooling/tsconfig.tsbuildinfo` :
      artefacts de build — vérifier qu'ils sont ignorés / à supprimer
- [ ] Rebuild `pnpm run build` + contrôle visuel du deck
- [ ] Timing : 10 chapitres en 2 jours = serré. Chronométrer chaque TP, marquer
      les sections « bonus » sautables
- [ ] Mettre à jour `RESSOURCES.md` avec la section « À lire » ci-dessous

## 00 — Intro

- [ ] Programme jour 1 / jour 2 : refléter tout ajout/déplacement de chapitre
- [ ] Phrase « based on TypeScript 7, Node.js 24, Vitest 5 » : versions exactes
- [ ] Prérequis : niveau JS attendu (ES2015+, async/await, modules)

## 01 — From JavaScript to TypeScript · TP 1

- [ ] Slide `tsconfig.json` : aligner sur les **nouveaux défauts TS 6/7**
      (`strict` par défaut, `types` vide par défaut, `module`/`target` par défaut)
      et sur la sortie actuelle de `tsc --init`
- [ ] Slide TS 7 : chiffres de perf réels, ce qui a changé (API du compilateur,
      plugins de language service), options retirées (cf. dépréciations 6.0)
- [ ] Type stripping : Node 24 sans flag ; mentionner `--experimental-transform-types`
      et ses limites
- [ ] TP 1 : l'exercice « activer `strict` » a-t-il encore du sens si `strict` est
      le défaut ? (mettre `"strict": false` explicite dans le starter)

## 02 — Everyday types · TP 2

- [ ] Enrichir le slide `using` : `await using`, `DisposableStack`
- [ ] Nouvelles API typées de `lib` récente : iterator helpers (`Iterator.from`,
      `.map`/`.filter` sur itérateurs), méthodes de `Set` (`union`, `intersection`),
      `Promise.withResolvers`, `Object.groupBy`
- [ ] TP 2 : éventuellement une étape `using` (ressource jetable)

## 03 — Classes & interfaces · TP 3

- [ ] Vérifier le slide « Erasable syntax only » face au comportement TS 7
- [ ] Teaser `accessor` (auto-accessors) vers chapitre 8
- [ ] TP 3 : relire les consignes après montée de versions

## 04 — Unions & narrowing · TP 4

- [ ] **Ajouter** : *inferred type predicates* (TS 5.5) — `arr.filter(x => x !== undefined)`
      narrowe tout seul. Absent des slides
- [ ] **Ajouter** : narrowing conservé dans les closures après dernière assignation (5.4)
      et sur accès indexé constant `obj[key]` (5.5)
- [ ] Erreurs « condition toujours vraie/fausse » sur checks nullish/truthy (5.6)
- [ ] Mention Zod (« that is what Zod is for ») : renvoyer vers le chapitre
      validation runtime si ajouté
- [ ] TP 4 : un `filter` dont le prédicat est inféré

## 05 — Generics · TP 5

- [ ] Slide bonus : annotations de variance `in` / `out` (absentes)
- [ ] Relire « Good practices » (un type param doit apparaître au moins 2 fois)
- [ ] TP 5 : relire après montée de versions

## 06 — Utility types · TP 6

- [ ] Vérifier la liste des utility types vs `lib.es5.d.ts` actuel
- [ ] `Awaited` avec `Promise.all` / tuples si pas assez montré
- [ ] TP 6 : relire après montée de versions

## 07 — Type-level programming · TP 7

- [ ] Limites de récursion (profondeur d'instanciation), tail-recursion des
      conditional types
- [ ] Renvoyer vers `type-challenges` en fin de chapitre
- [ ] TP 7 : vérifier les temps de check sous TS 7 (`Get<'a.b.c'>`)

## 08 — Decorators · TP 8

- [ ] Statut TC39 décorateurs + metadata, support natif navigateurs/Node
      (`src/polyfill.ts` pour `Symbol.metadata` encore nécessaire ?)
- [ ] Support des décorateurs par outil (Node type stripping, esbuild/tsx, swc) : à jour
- [ ] Chapitre le plus long (400 lignes) : candidat à raccourcir si besoin de temps

## 09 — Modules & declaration files · TP 9

- [ ] **Ajouter** : `import defer` (5.9), `--module node20`, `require(esm)` sous
      `nodenext` (5.8)
- [ ] **Ajouter** : `noUncheckedSideEffectImports` (5.6)
- [ ] Subpath imports `#…` (`imports` dans `package.json`)
- [ ] Slide « ce qui n'existe plus » en TS 6/7 : `moduleResolution: node10`,
      `baseUrl`, `outFile`, AMD/UMD/System, `esModuleInterop: false`…
- [ ] TP 9 : `tsconfig.build.json` sans options retirées

## 10 — Tooling · TP 10

- [ ] « `tsconfig.json` — the essentials » : réaligner sur défauts TS 6/7 (cf. ch. 1)
- [ ] `--noCheck`, `--stableTypeOrdering` (diff TS 6 vs 7), build parallèle TS 7
- [ ] typescript-eslint : état du support TS 7 natif (API compilateur)
- [ ] Tableau « Running TypeScript » (`node`, `tsx`, Bun, Deno) à jour
- [ ] TP 10 : project references sous TS 7 (`tsc -b`)

## Chapitres à ajouter (proposition)

2 jours déjà pleins : ajouter = remplacer, fusionner ou passer en bonus.

1. **Validation runtime — Zod / Standard Schema** (prioritaire). Frontière
   `unknown` → type sûr, `z.infer`, Standard Schema comme interface commune
   Zod/Valibot/ArkType. Petit TP : parser une réponse d'API. Peut absorber la
   fin du ch. 4.
2. **Migrer un projet JS** — `allowJs`, `checkJs`, JSDoc typé, `@ts-expect-error`,
   activation progressive de `strict`. Très demandé en entreprise.
3. **Asynchrone & erreurs** — `useUnknownInCatchVariables`, type `Result`,
   `Awaited`, `AbortSignal`. Court, bonus possible.
4. **Slide « Quoi de neuf » 5.x → 6.0 → 7.0** — synthèse en ouverture ou fin de jour 2.

Pour libérer du temps : fusionner 05/06, raccourcir 08.

## À lire — nouveautés TypeScript

Release notes (priorité 5.5 → 7.0) :

- [ ] https://devblogs.microsoft.com/typescript/ (annonces TS 6.0 et 7.0)
- [ ] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html
      (inferred type predicates, `isolatedDeclarations`, regex checking)
- [ ] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-6.html
      (iterator helpers, `noUncheckedSideEffectImports`, `--noCheck`)
- [ ] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html
      (`rewriteRelativeImportExtensions`, ES2024)
- [ ] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html
      (`erasableSyntaxOnly`, `require(esm)`, `--module node18`)
- [ ] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html
      (`import defer`, `--module node20`, nouveau `tsc --init`)
- [ ] Release notes TS 6.0 (pont vers TS 7 : nouveaux défauts, dépréciations)
- [ ] Release notes TS 7.0 (compilateur natif, ruptures)
- [ ] https://github.com/microsoft/typescript-go (état des features, API compilateur)
- [ ] https://github.com/microsoft/TypeScript/wiki/Roadmap
- [ ] https://github.com/microsoft/TypeScript/releases

Écosystème :

- [ ] https://nodejs.org/api/typescript.html (type stripping, état actuel)
- [ ] https://github.com/standard-schema/standard-schema
- [ ] https://typescript-eslint.io/blog (support TS 7)
- [ ] https://github.com/tc39/proposals (décorateurs, `import defer`, Temporal…)
- [ ] https://www.totaltypescript.com/articles
- [ ] https://github.com/type-challenges/type-challenges
