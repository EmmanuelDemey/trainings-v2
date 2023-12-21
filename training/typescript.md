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
src: ./chapters/typescript/setup.md
hide: false
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

- Les décorateurs sont des mots clés préfixés par **@**
- Très utilisés dans **Angular** et **Nest.js**
- Ils ne s'appliquent que sur des classes
- Nous avons 5 types de décorateurs
  - Class Decorators
  - Property Decorators
  - Method Decorators
  - Accessor Decorators
  - Parameter Decorators

---

# Class Decorators

```typescript
type ClassDecorator = <TFunction extends Function>
  (target: TFunction) => TFunction | void;
```

```typescript
type Constructor = { new (...args: any[]): any };

function toString<T extends Constructor>(BaseClass: T) {
  return class extends BaseClass {
    toString() {
      return JSON.stringify(this);
    }
  };
}

@toString
class C {
  public foo = "foo";
  public num = 24;
}

console.log(new C().toString())
// -> {"foo":"foo","num":24}
```

---

# Property Decorators

```typescript
type PropertyDecorator =
  (target: Object, propertyKey: string | symbol) => void;
```

```typescript
function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function observable(target: any, key: string): any {
  // prop -> onPropChange
  const targetKey = "on" + capitalizeFirstLetter(key) + "Change";

  target[targetKey] =
    function (fn: (prev: any, next: any) => void) {
      let prev = this[key];
      Reflect.defineProperty(this, key, {
        set(next) {
          fn(prev, next);
          prev = next;
        }
      })
    };
}

class C {
  @observable
  foo = -1;

  @observable
  bar = "bar";
}

const c = new C();

c.onFooChange((prev, next) => console.log(`prev: ${prev}, next: ${next}`))
c.onBarChange((prev, next) => console.log(`prev: ${prev}, next: ${next}`))

c.foo = 100; // -> prev: -1, next: 100
c.bar = "baz"; // -> prev: bar, next: baz
```

---

# Method Decorators

```typescript
type MethodDecorator = <T>(
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;
```

```typescript
function logger(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;

  descriptor.value = function (...args) {
    console.log('params: ', ...args);
    const result = original.call(this, ...args);
    console.log('result: ', result);
    return result;
  }
}

class C {
  @logger
  add(x: number, y:number ) {
    return x + y;
  }
}

const c = new C();
c.add(1, 2);
```

---

# Accessor Decorators

```typescript
function immutable(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.set;

  descriptor.set = function (value: any) {
    return original.call(this, { ...value })
  }
}

class C {
  private _point = { x: 0, y: 0 }

  @immutable
  set point(value: { x: number, y: number }) {
    this._point = value;
  }

  get point() {
    return this._point;
  }
}

const c = new C();
const point = { x: 1, y: 1 }
c.point = point;

console.log(c.point === point)
```

---

# Parameter Decorators 

```typescript
type ParameterDecorator = (
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) => void;
```

```typescript
import "reflect-metadata";
const requiredMetadataKey = Symbol("required");
 
function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata( requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}
 
function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value!;
 
  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, arguments);
  };
}

class BugReport {
  type = "report";
  title: string;
 
  constructor(t: string) {
    this.title = t;
  }
 
  @validate
  print(@required verbose: boolean) {
    if (verbose) {
      return `type: ${this.type}\ntitle: ${this.title}`;
    } else {
     return this.title; 
    }
  }
}
```

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


# Liens

- https://www.youtube.com/watch?v=Lkgpy_ctzIo[Zod/ArkType, Comment typer vos applications JS au runtime]
