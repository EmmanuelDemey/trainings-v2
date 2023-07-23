---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
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

# TypeScript

---

# Plan

---

# tsc

- **tsc** est le module NPM permettant de compiler notre code TypeScript en JavaScript. 
- Il se base sur un fichier de configuration **tsconfig.json**

```json
```

---

# tsc

* Nous pouvons utiliser les options **extendedDiagnostics** et **generateTrace** afin d'avoir des informations sur les performances de la compilation. 

```shell
npx tsc --extendedDiagnostics

npx tsc --generateTrace <path>
npx @typescript/analyze-trace <path>
```

* Voici le résultat qui sera retourné lors de l'utilisation de **extendedDiagnostics** : 

```
Files:                         90
Lines of TypeScript:           83
Lines of JavaScript:            0
Lines of JSON:               2448
Parse time:                 0.42s
ResolveModule time:         0.02s
ResolveTypeReference time:  0.00s
Program time:               0.48s
Bind time:                  0.20s
Check time:                 2.64s
Emit time:                  0.00s
Total time:                 3.32s
Done in 3.53s.
```

---

# Execution 

Pour exécuter une fichier typescript, nous avons deux solutions

* Une compilation via **tsc** et ensuite vous exécutez via **node**

```shell
tsc index.ts
node index.js
```

* Une compilation et une exécution via **ts-node**

```shell
ts-node index.ts
```

---

# Type Guards

---

# Generics

---

# Advanced Types

* Nous allons aborder dans cette partie les types avancés proposés par le langage
  * Branding
  * MappedTyped
  * Conditional Types 

--- 

# Branding

* Les types **Branding** est un pattern permettant de spécifier une donnée qui ne l'est pas (un type primitif). 

```typescript
type PostId = number;
type CommentId = number;

const postId: PostId = post.id;
const commentId: CommentId = postId; // OK
```

* Pour cela nous allons ajouter un *label* à notre type. 

``` typescript
type PostId = number & { __brand: 'PostId' };
type CommentId = number & { __brand: 'CommentId' };

const value = 1 as PostId;

const postId: PostId = value; // OK
const commentId: CommentId = value; // Erreur
```
--- 

# Branding

* Nous pouvons utiliser les *generics* afin de définir un type réutilisable. 

```typescript
type Brand<T, U> = T & { __brand: U };

type PostId = Brand<number, 'PostId'>;
type CommentId = Brand<number, 'CommentId'>;
```
---

# Mapped Types 

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface Point {
  x: number;
  y: number;
}

type ReadonlyPoint = Readonly<Point>;
```

--- 

# Conditional Types 

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

--- 

# Decorators

* Class Decorators
* Method Decorators
* Property Decorators
* Parameter Decorators

---

# Tests unitaires

---
