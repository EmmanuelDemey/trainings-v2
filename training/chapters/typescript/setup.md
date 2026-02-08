
# Introduction à TypeScript

* TypeScript est un langage de Microsoft
* Créé par le créateur des langages **Delphi** et **C#**
* C'est un *superset* de JavaScript
    * Tout ce qui est faisable en JavaScript l'est également en TypeScript
    * TypeScript ajoute le mécanisme de typage au langage
* Une phase de compilation sera donc nécessaire pour que le code soit exécutable. 

---

# Ligne de commande

- Pour initier un projet TypeScript simple, nous pouvons utiliser la ligne de commande suivante.

```
cd project
npm init --yes
npm install -D typescript
npx tsc -init
```

- Un fichier de configuration `tsconfig.json` sera créé

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
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
npx ts-node hello.ts
```

- Un fichier JavaScript du même nom sera créé.

---

# Fonctionnement d'une compilation

- Quand nous exécutons le compilateur, plusieurs briques sont en fait exécutées les unes à la suite des autres
  - le _scanner_ pour générer un stream de Token
  - le _parser_ pour générer un Abstract Syntax Tree (AST)
  - le _binder_ pour connecter les différentes parties du code afin de bénéficier du type checking
  - le _checker_ pour la vérification des types dans votre programme
  * le _emitter_ pour la génération du JavaScript

---

# Options avancées de la ligne de commande

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

# Options avancées de la ligne de commande

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

- Plusieurs IDE peuvent être utilisés pour écrire du code TypeScript
  - WebStorm
  - Intellij IDEA
  - Visual Studio Code
    - ajout de l'extension **yoavbls.pretty-ts-errors**

---

# Documentation 

* Pour générer une documentation à partir de commentaires de votre code, un standard a été créé : **tsdoc** 

```typescript
export class Statistics {
  /**
   * Returns the average of two numbers.
   *
   * @remarks
   * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   *
   * @beta
   */
  public static getAverage(x: number, y: number): number {
    return (x + y) / 2.0;
  }
}
```

* De nombreux outils se basent sur ce standard comme par exemple **Visual Studio Code** ou encore **typedoc**.

```shell
npm install typedoc --save-dev
typedoc src/index.ts
```

---

# Tests unitaires

* Pour écrire des tests unitaires, nous pouvons utiliser les mêmes outils que pour JavaScript : **Jest** ou **Vitest**

```shell
npm install --save-dev jest ts-jest @types/jest
```

* Et ensuite configurer Jest pour que les fichiers TypeScript soient compilés avant exécution. 

```shell
npx ts-jest config:init

```

---

# Tests unitaires 

```typescript
import {sum} from './sum';

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
```

---
