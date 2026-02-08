---
layout: cover
---

# RxJS

---

# RxJS

- **RxJS** (Reactive Extensions for JavaScript) est une librairie de programmation réactive
- Angular utilise RxJS pour les opérations asynchrones (HTTP, Router, Forms, etc.)
- Concept clé : un **Observable** émet des valeurs au fil du temps, que l'on transforme avec des **opérateurs**

---

# `of` et `from`

- `of` crée un Observable à partir de valeurs
- `from` crée un Observable à partir d'un tableau ou d'une Promise

```typescript
import { of, from } from 'rxjs';

of(1, 2, 3).subscribe(value => console.log(value)); // 1, 2, 3

from([10, 20, 30]).subscribe(value => console.log(value)); // 10, 20, 30

from(fetch('/api/users')).subscribe(response => console.log(response));
```

---

# `map` et `filter`

- `map` transforme chaque valeur émise
- `filter` ne laisse passer que les valeurs satisfaisant une condition

```typescript
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3, 4, 5).pipe(
  filter(n => n % 2 === 0),
  map(n => n * 10)
).subscribe(value => console.log(value)); // 20, 40
```

---

# `switchMap`

- `switchMap` projette chaque valeur vers un nouvel Observable, en annulant le précédent
- Très utile pour les recherches en temps réel (on annule la requête précédente)

```typescript
import { switchMap, debounceTime } from 'rxjs/operators';

this.searchControl.valueChanges.pipe(
  debounceTime(300),
  switchMap(query => this.http.get(`/api/search?q=${query}`))
).subscribe(results => this.results = results);
```

---

# `catchError`

- `catchError` intercepte les erreurs dans un Observable et retourne un Observable de remplacement

```typescript
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

this.http.get('/api/users').pipe(
  catchError(error => {
    console.error('Erreur:', error);
    return of([]); // Retourne un tableau vide en cas d'erreur
  })
).subscribe(users => this.users = users);
```

---

# `tap`

- `tap` permet d'exécuter un effet de bord sans modifier les valeurs (utile pour le debug)

```typescript
import { tap, map } from 'rxjs/operators';

this.http.get<User[]>('/api/users').pipe(
  tap(users => console.log('Reçu:', users.length, 'utilisateurs')),
  map(users => users.filter(u => u.active))
).subscribe(activeUsers => this.users = activeUsers);
```

---

# `takeUntil` et `takeUntilDestroyed`

- `takeUntil` se désabonne automatiquement quand un autre Observable émet
- Depuis Angular 16, `takeUntilDestroyed` simplifie le pattern de désabonnement

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({ ... })
export class UserComponent {
  constructor() {
    this.userService.getUsers().pipe(
      takeUntilDestroyed() // Se désabonne automatiquement à la destruction
    ).subscribe(users => this.users = users);
  }
}
```

---

# `debounceTime` et `distinctUntilChanged`

- `debounceTime` attend un délai d'inactivité avant d'émettre
- `distinctUntilChanged` n'émet que si la valeur a changé
- Combinés, ils sont parfaits pour les champs de recherche

```typescript
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

this.searchControl.valueChanges.pipe(
  debounceTime(300),              // Attend 300ms après la dernière frappe
  distinctUntilChanged(),          // Ignore si la valeur n'a pas changé
  switchMap(query => this.search(query))
).subscribe(results => this.results = results);
```

---

# `combineLatest`

- `combineLatest` combine les dernières valeurs de plusieurs Observables
- Émet dès que chaque source a émis au moins une valeur

```typescript
import { combineLatest } from 'rxjs';

combineLatest([
  this.route.params,
  this.route.queryParams
]).subscribe(([params, queryParams]) => {
  const id = params['id'];
  const page = queryParams['page'];
  this.loadData(id, page);
});
```
