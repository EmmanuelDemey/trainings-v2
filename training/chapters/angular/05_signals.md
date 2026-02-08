---
layout: cover
---

# Réactivité - Signals

---

# Réactivité - Signals

- Depuis Angular 17, l'API des **Signals** est **stable**
- Les Signals offrent une alternative réactive plus simple que RxJS pour gérer l'état

```typescript
import { signal, computed, effect } from '@angular/core';

const count = signal(0);
const doubled = computed(() => count() * 2);

// Lire un signal : appeler comme une fonction
console.log(count()); // 0
console.log(doubled()); // 0

// Modifier un signal
count.set(5);
count.update(value => value + 1);

// Effet : réagir aux changements
effect(() => {
  console.log(`Le compteur vaut : ${count()}`);
});
```

---

# Signals - input() et output()

- Depuis Angular 17.1+, les décorateurs `@Input()` et `@Output()` ont des alternatives fonctionnelles

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-user-card',
  template: `
    <div>{{ name() }}</div>
    <button (click)="delete.emit()">Supprimer</button>
  `,
})
export class UserCardComponent {
  // input obligatoire
  name = input.required<string>();

  // input optionnel avec valeur par défaut
  role = input<string>('user');

  // output
  delete = output<void>();
}
```

---

# Signals - model() et linkedSignal()

- `model()` permet le two-way binding basé sur les signals
- `linkedSignal()` (Angular 19) crée un signal lié à un autre avec transformation

```typescript
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-search',
  template: `<input [(ngModel)]="query" />`,
})
export class SearchComponent {
  query = model<string>('');
}
```

```html
<!-- Utilisation avec two-way binding -->
<app-search [(query)]="searchTerm" />
```

---

# Signals - Interop avec RxJS

- `toSignal()` et `toObservable()` permettent de convertir entre Signals et Observables

```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({ ... })
export class SearchComponent {
  query = signal('');

  // Signal → Observable
  query$ = toObservable(this.query);

  // Observable → Signal
  results = toSignal(
    this.query$.pipe(
      debounceTime(300),
      switchMap(q => this.searchService.search(q))
    ),
    { initialValue: [] }
  );
}
```
