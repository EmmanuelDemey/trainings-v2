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

# Introduction à TypeScript

---

# IDE

* Plusieurs IDE peuvent être utilisée pour écrire du code TypeScript
  * WebStorm
  * Intellij IDEA
  * Visual Studio Code
    * ajout de l'extension **yoavbls.pretty-ts-errors**

---

# Les bases de TypeScript 

---


# Les classes et l'héritage en TypeScript

* **JavaScript** et **TypeScript** propose un système d'héritage
  * utilise le mécanisme de *prototype* disponible dans le langage **JavaScript**
* Nous pouvons utiliser le mot clé **super** pour faire appel à l'implémentation de la méthode parent

```typescript
export class Dog extends Animal {
  voice: string = "ouaf";

  constructor(name: string){
    super(name)
  }

  sayHello(){
    super.sayHello(this.voice);
  }

}
```

---


# Les Scopes

* Sur les variables d'instances, de nombreux *keywords* peuvent être utilisés. 
  * private
  * public
  * protected
  * readonly

```typescript
export class UserController {
  private name: string;

  readonly private service: UserService;
}
```

* Nous pouvons définir directement le scope dans la signature du constructeur .

```typescript
export class UserController {
  constructor(private name: string){
    
  }
}
```

---

# Les types avancés

* Nous allons aborder dans cette partie les types avancés proposés par le langage
  * Generics
  * Literal Types
  * Union et Intersection
  * Partial, Pick, Omit et Required
  * Branding
  * MappedTyped
  * Conditional Types 

---

# Generics

* Les **Generics** permet de paramètrer via des types.
* Cela permet de réutiliser du code tout en gardant le coté *type safe*

```typescript
const clone = <T>(object: T) => {
  const clonedObject: T = JSON.parse(JSON.stringify(object));
  return clonedObject;
};

const user: User = {
  firstName: 'Manu',
  lastName: 'Demey'
};

const user2 = clone<User>(user);
```

---

# Literal Types

* Nous pouvons définir un type représentant un ensemble de valeurs

```typescript
type Status = "idle" | "loading" | "success" | "error";
type Review = 1 | 2 | 3 | 4 | 5;
```

---

# Union et Intersection

* Nous pouvons créer des types qui sont une composition de plusieurs types

```typescript
type UserOrAnimal = User | Animal;
type UserAndAnimal = User & Animal;
```

---

# Partial, Pick, Omit et Required

*  Types permettant de modifier des types existant

```typescript
interface User {
  name: string;
  age?: number;
  email: string;
}

type PartialUser = Partial<User>;
type PickUser = Pick<User, "name" | "age">;
type OmitUser = Omit<User, "age">;
type RequiredUser = Required<User>;
```

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

# Type Guards

* Un **type guard** est un mécanisme permettant d'informer du type d'une donnée à partir d'une condition. 
* Le type effectif sera indiqué dans la signature de la méthode *guard* grâce à **is**.

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

* Class Decorators
* Method Decorators
* Property Decorators
* Parameter Decorators

---

# Les outils et bonnes pratiques --- 

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

# Fichiers de Définition

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

# Tests unitaires

---

# Projet pratique 

// Faire un TP de todolist en ligne 

---

# Liens 

* https://www.youtube.com/watch?v=Lkgpy_ctzIo[Zod/ArkType, Comment typer vos applications JS au runtime]