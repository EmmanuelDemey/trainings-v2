---
layout: cover
---

# Dynamisation HTML

---

# Control Flow

- Depuis Angular 17, nous avons à notre disposition de nouvelles syntaxes pour dynamiser un template

  - **@if** / **@else**
  - **@for**
  - **@switch**

- Ces syntaxes remplacent le système de directives structurelles `*ngIf`, `*ngFor` ou `ngSwitch`

```html
@if(isAdmin){
<admin-dashboard></admin-dashboard>
} @else {
<public-dashboard></public-dashboard>
}
```

---

# Switch

```html
@switch (condition) {
  @case (caseA) {
    Case A.
  }
  @case (caseB) {
    Case B.
  }
  @default {
    Default case.
  }
}
```

---

# For

- Directive permettant d'itérer sur une collection
- Elle propose plusieurs propriétés permettant d'avoir des informations sur l'itération en cours.
- L'expression `track` est **obligatoire** pour identifier chaque élément.

```typescript
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <ul>
      @for (
        person of people;
        track person;
        let i = $index;
        let isFirst = $first;
        let isLast = $last;
        let isOdd = $odd;
        let isEven = $even
      ) {
        <li>
          {{ person }} {{ i }} {{ isFirst }} {{ isLast }} {{ isOdd }}
          {{ isEven }}
        </li>
      }
    </ul>
  `,
})
export class RootComponent {
  people: string[] = ["Joe", "John"];
}
```

---

# For - track

- Syntaxe permettant d'identifier un élément dans la liste de données manipulée par le **@for**
- Permet d'améliorer les performances de l'application

```html
<li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>
```

```typescript
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <ul>
      @for (person of people; track person.id) {
        <li>{{ person.label }}</li>
      }
    </ul>
  `,
})
export class RootComponent {
  people: { id: number; label: string }[] = [{ id: 0, label: "Joe" }];
}
```
