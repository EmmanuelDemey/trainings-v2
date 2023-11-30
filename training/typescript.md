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

# TypeScript

---

# Introduction à TypeScript

---

# Ligne de commande

- Pour initier un projet TypeScript simple, nous pouvons utiliser la ligne de commande suivante.

```
cd project
npm init --yes
npm install -D typescript
npx tsc -init
```

- Une fichier de configuration `tsconfig.json` sera créé

```json
{
  "name": "tsc",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}


➜  tsc npm i -D typescript

added 1 package, and audited 2 packages in 6s

found 0 vulnerabilities
➜  tsc npx tsc init
error TS6231: Could not resolve the path 'init' with the extensions: '.ts', '.tsx', '.d.ts', '.cts', '.d.cts', '.mts', '.d.mts'.
  The file is in the program because:
    Root file specified for compilation


Found 1 error.

➜  tsc npx tsc -init

Created a new tsconfig.json with:
                                                                                                                     TS
  target: es2016
  module: commonjs
  strict: true
  esModuleInterop: true
  skipLibCheck: true
  forceConsistentCasingInFileNames: true


You can learn more at https://aka.ms/tsconfig
➜  tsc npx tsc -initc
➜  tsc cat tsconfig.json
{
  "compilerOptions": {

    /* Language and Environment */
    "target": "es2016",

    /* Modules */
    "module": "commonjs",

    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    /* Type Checking */
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

# Compilation

- Nous pouvons à présent compiler et créer un fichier typescript.

```typescript
console.log("hello");
```

```shell
npx tsc
npx tsc hello.ts
```

- Un fichier JavaScript du même nom sera créé.

---

# Fonctionnement d'une compilation

- Quand nous executions le compulateur, plusieurs briques sont en fait exécutées les unes à la suite des autres
  - le _scanner_ pour générer une stream de Token
  - le _parser_ pour générer un Abstract Syntax Tree (AST)
  - le _binder_ pour connecter les différentes parties du code afin de bénéfichier du type checking
  - le _checker_ pour la vérification des types dans votre programme
  * le _emitter_ pour la génération du JavaScript

---

# Options avancée de la ligne de commande

- `npx tsc --showConfig` permet de visualiser la configuration effective du compilateur

```shell
npx tsc --showConfig
{
    "compilerOptions": {
        "target": "es2016",
        "module": "commonjs",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "skipLibCheck": true
    },
    "files": [
        "./hello.ts"
    ]
}
```

---

# Options avancée de la ligne de commande

- `npx tsc --listFiles` va lister les fichier TypeScript qui seront manipulés par le compilateur.

```shell
 npx tsc --listFiles
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es5.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2016.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.dom.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.dom.iterable.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.webworker.importscripts.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.scripthost.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.core.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.collection.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.generator.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.iterable.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.promise.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.proxy.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.reflect.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.symbol.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2016.array.include.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.decorators.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.decorators.legacy.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/node_modules/typescript/lib/lib.es2016.full.d.ts
/Users/emmanueldemey/Documents/workspaces/testbed/tsc/hello.ts
```

# IDE

- Plusieurs IDE peuvent être utilisée pour écrire du code TypeScript
  - WebStorm
  - Intellij IDEA
  - Visual Studio Code
    - ajout de l'extension **yoavbls.pretty-ts-errors**

---

# Les bases de TypeScript

- Pour déclarer une variable, nous avons les mêmes mots clés que JavaScript

```typescript
var firstName = "Manu";
let firstName = "Manu";
const firstName = "Manu";
```

- Nous avons également le mot clé `using` permettant de faciliter la phase de cleanup quand la variable n'est plus nécessaire.

```typescript
const getConnection = () => {
  const connection = getDb();

  return {
    connection,
    //Symbol.asyncDispose
    [Symbol.dispose]: () => {
      connection.close();
    },
  };
};

using { connection } = getConnection();
```

# Les bases de TypeScript

- `const` permet d'indiquer que la variable n'est pas réassignée.
- Mais nous pouvons tout de même la modifier

```typescript
const user = {};
user.firstName = "Manu";
```

- Si nous souhaitons indiquer que la variable n'est absolument pas modifible, nous pouvons utiliser la syntaxe `as const`

```typescript
const user = {} as const;
user.firstName = "Manu"; // Error
```

---

# Les bases de TypeScript

---

# Les classes et l'héritage en TypeScript

- **JavaScript** et **TypeScript** propose un système d'héritage
  - utilise le mécanisme de _prototype_ disponible dans le langage **JavaScript**
- Nous pouvons utiliser le mot clé **super** pour faire appel à l'implémentation de la méthode parent

```typescript
export class Dog extends Animal {
  voice: string = "ouaf";

  constructor(name: string) {
    super(name);
  }

  sayHello() {
    super.sayHello(this.voice);
  }
}
```

---

# Les Scopes

- Sur les variables d'instances, de nombreux _keywords_ peuvent être utilisés.
  - private
  - public
  - protected
  - readonly

```typescript
export class UserController {
  private name: string;

  private readonly service: UserService;
}
```

- Nous pouvons définir directement le scope dans la signature du constructeur .

```typescript
export class UserController {
  constructor(private name: string) {}
}
```

---

# Les types avancés

- Nous allons aborder dans cette partie les types avancés proposés par le langage
  - Generics
  - Literal Types
  - Union et Intersection
  - Partial, Pick, Omit et Required
  - Branding
  - MappedTyped
  - Recursive Types
  - Conditional Types

---

src: ./chapters/typescript/generics.md
hide: false

---

# Literal Types

- Nous pouvons définir un type représentant un ensemble de valeurs

```typescript
type Status = "idle" | "loading" | "success" | "error";
type Review = 1 | 2 | 3 | 4 | 5;
```

---

# Union et Intersection

- Nous pouvons créer des types qui sont une composition de plusieurs types

```typescript
type UserOrAnimal = User | Animal;
type UserAndAnimal = User & Animal;
```

---

# Union

```typescript
type Stage = "empty" | "personalInfo" | "billingInfo";

function allowSubmit(stage: Stage) {}

allowSubmit("empty"); // OK
allowSubmit("inPayment"); // Error: Argument of type '"inPayment"'
```

---

# Union

```typescript
type PostAttachment = {
  type: string; // Can be "image", "video" or "audio"
  url: string;
  altText?: string;
  lowResUrl?: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
};
```

```typescript
type Image = {
  type: "image";
  url: string;
  altText: string;
  lowResUrl: string;
};

type Video = {
  type: "video";
  url: string;
  altText: string;
  thumbnailUrl: string;
  autoplay: boolean;
};

type Audio = {
  type: "audio";
  url: string;
  autoplay: boolean;
};

type PostAttachment = Image | Video | Audio;
```

---

src: ./chapters/typescript/advanced-types.md
hide: false

---

# Branding

- Les types **Branding** est un pattern permettant de spécifier une donnée qui ne l'est pas (un type primitif).

```typescript
type PostId = number;
type CommentId = number;

const postId: PostId = post.id;
const commentId: CommentId = postId; // OK
```

- Pour cela nous allons ajouter un _label_ à notre type.

```typescript
type PostId = number & { __brand: "PostId" };
type CommentId = number & { __brand: "CommentId" };

const value = 1 as PostId;

const postId: PostId = value; // OK
const commentId: CommentId = value; // Erreur
```

---

# Branding

- Nous pouvons utiliser les _generics_ afin de définir un type réutilisable.

```typescript
type Brand<T, U> = T & { __brand: U };

type PostId = Brand<number, "PostId">;
type CommentId = Brand<number, "CommentId">;
```

---

# Template Literals

```typescript
type ChessLetter = "A" | "B" | "C";
type ChessNumber = 1 | 2 | 3;
type Board = `${ChessLetter}${ChessNumber}`;
```

```typescript
type RGBCss = `rgb(${number}, ${number}, ${number})`;
const wrongCSS: RGBCss = "rgb(1, 1)"; // Error
const correctCSS: RGBCss = "rgb(1, 1, 1)";
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

# Mapped Types

```typescript
type Event = {
  add: string;
  remove: string;
  move: string;
};

type EventKeys = keyof Event;
type OnEvent = {
  [Key in EventKeys as `on${Capitalize<Key>}`]: () => any;
};

const eventHandlers: OnEvent = {
  onAdd: () => {},
  onRemove () => {},
  onMove: () => {},
}
```

---

# Conditional Types

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

---

# Recursive Types

- Tout comme la récurisivité en programmation, nous pouvons utiliser ce mécanisme pour définir des types évolués.

```typescript
// Ceci est une réimplementation du Awaited
type Awaited<T> = T extends Array<infer Inner> ? Awaited<Inner> : T;
```

- Voici un exemple un peu plus compliqué.

```typescript
type RGBTuple = Tuple<3, number>;

type Typle<Length, TupleType, Acc extends TupleType[] = []> = Acc["length"] extends Length
  ? Acc
  : Tuple<Length, TupleType, [...Acc, TupleType]>;
```

---

# Type Guards

- Un **type guard** est un mécanisme permettant d'informer du type d'une donnée à partir d'une condition.
- Le type effectif sera indiqué dans la signature de la méthode _guard_ grâce à **is**.

```typescript
function isNumber(value: any): value is number {
  return typeof value === "number";
}

const validateAge = (age: number | string) => {
  if (isNumber(age)) {
  } else {
  }
};
```

---

# Les modules et la gestion des dépendances

---

# Les décorateurs

- Class Decorators
- Method Decorators
- Property Decorators
- Parameter Decorators

---

# Les outils et bonnes pratiques ---

# tsc

- **tsc** est le module NPM permettant de compiler notre code TypeScript en JavaScript.
- Il se base sur un fichier de configuration **tsconfig.json**

```json

```

---

# tsc

- Nous pouvons utiliser les options **extendedDiagnostics** et **generateTrace** afin d'avoir des informations sur les performances de la compilation.

```shell
npx tsc --extendedDiagnostics

npx tsc --generateTrace <path>
npx @typescript/analyze-trace <path>
```

- Voici le résultat qui sera retourné lors de l'utilisation de **extendedDiagnostics** :

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

# Fichiers de Définition

---

# Execution

Pour exécuter une fichier typescript, nous avons deux solutions

- Une compilation via **tsc** et ensuite vous exécutez via **node**

```shell
tsc index.ts
node index.js
```

- Une compilation et une exécution via **ts-node**

```shell
ts-node index.ts
```

---

# Tests unitaires

---

# Projet pratique

// Faire un TP de todolist en ligne

---

# Liens

- https://www.youtube.com/watch?v=Lkgpy_ctzIo[Zod/ArkType, Comment typer vos applications JS au runtime]
