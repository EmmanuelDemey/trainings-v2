# TypeScript

---

# Plan

---

# Advanced Types

* Mapped Types 

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

# Advanced Types

* Conditional Types 

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
