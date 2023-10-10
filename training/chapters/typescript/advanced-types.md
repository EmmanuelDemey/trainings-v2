# Types Avancés - Partial

- Types permettant de modifier des types existant

```typescript
interface User {
  name: string;
  age?: number;
  email: string;
}
```

- **Partial** permet de mettre tous les champs optionnels.

```typescript
type PartialUser = Partial<User>;

/*
{
  name?: string;
  age?: number;
  email?: string;
}
*/
```

---

# Types Avancés - Required et Omit

- **Required** permet de mettre tous les champs obligatoires.

```typescript
type PartialUser = Required<User>;

/*
{
  name: string;
  age: number;
  email: string;
}
*/
```

- **Omit** permet de supprimer des propriétés.

```typescript
type PartialUser = Omit<User, "name" | "age">;

/*
{
  email: string;
}
*/
```

---

# Types Avancés - Pick et ReadOnly

- **Pick** permet de garder certains champs.

```typescript
type PartialUser = Pick<User, "name" | "age">;

/*
{
  name: string;
  age: number;
}
*/
```

- **Readonly** permet de rendre tous les champs _readonly_.

```typescript
type PartialUser = Readonly<User>;

/*
{
  readonly name: string;
  readonly age: number;
  readonly email: string;
}
*/
```

---
