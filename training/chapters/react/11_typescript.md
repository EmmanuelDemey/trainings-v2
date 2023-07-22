@cover
# TypeScript

---

# TypeScript

* Typescript est un superset de JavaScript
* Développé par Microsoft et utilisé dans de nombreux projets
* Ajoute notamment le typage au langage JavaScript
* Nécessite une phase de compilation
* Les fichiers utilisent l'extension `.ts`

---

# Types

* Nous pouvons :
    * typer les paramètres des fonctions
    * typer les valeurs retournées des fonctions
    * typer les variables d'une instance d'un objet
    * créer des interface
    * définir des génériques
    * utiliser des types avancés

--- 

# Types

```typescript
function lowercase(word: string): string {
    return word.toLowerCase();
}
```

* Si nous utilisons la méthode avec la mauvaise signature, nous allons avoir des erreurs de compilation.

```typescript
lowercase("react") // OK
lowercase(1) // TypeScript Error
lowercase("react").length // OK
lowercase("react").push({ }) // TypeScript Error
```

---

# Custom Types

* Nous pouvons définir des types custom via :
    * des classes
    * des interfaces
    * via le mot clé `type`

```typescript
type User = {
    firstName: string;
    lastName: string;
    age ?: number
}
const user: User = { firstName: 'James`, lastName: 'Bond' };
```
