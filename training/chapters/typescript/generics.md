# Generics

- Les **Generics** permettent de paramétriser via des types.
- Cela permet de réutiliser du code tout en gardant le côté _type safe_

```typescript
function echo<T>(arg: T): T {
  return arg;
}
let result = echo("Hello, TypeScript"); // result is of type 'string'
```

- Les Generics sont par exemple utilisés dans
  - les tableaux
  - les _Promises_
  - API Requests
  - Types avancés : Required, Omit, ...

---

# Generics

- Les **Generics** ne sont pas limitées que aux fonctions. Nous pouvons les utiliser dans les classes

```typescript
class Box<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}

let numberBox = new Box<number>(42);
let stringBox = new Box<string>("Hello, TypeScript");
```
