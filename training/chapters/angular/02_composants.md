---
layout: cover
---

# Composants

---

# Composants Standalone

- Angular propose les **Standalone components** pour activer les composants globalement
- Avant Angular 17, nous étions obligés d'utiliser des **NgModule**
- Depuis Angular 19, `standalone: true` est la valeur par défaut (il n'est plus nécessaire de le spécifier)

```typescript
@Component({
  selector: 'app-foo',
  templateUrl: './foo.component.html',
})
export class FooComponent {
}
```

---

# Input obligatoires

- Depuis **Angular 16**, nous pouvons définir que des _input_ sont obligatoires.

```typescript
@Component({
  selector: "app-error",
  templateUrl: "./error.component.html",
})
export class ErrorMessage {
  @Input({ required: true }) error: string;
}
```

---

# Composants

- Pour créer un composant, nous pouvons utiliser **@angular/cli**

```shell
npm run ng generate component login
npm run ng g c login
```

- Afin de définir une configuration par défaut pour tous les composants générés, nous pouvons modifier la configuration **angular.json**

```json
{
  "@schematics/angular:component": {
    "standalone": true,
    "inlineTemplate": true,
    "inlineStyle": true,
    "flat": true,
    "changeDetection": "OnPush"
  }
}
```

---

# Directives

---

# @Attribute

- Dans une directive, si vous souhaitez récupérer, en lecture seule, la valeur d'un attribut présent sur l'élément sur lequel vous avez mis la directive, vous pouvez utiliser la directive **@Attribute**

```typescript
import { Directive, Attribute } from "@angular/core";
@Directive({
  selector: "[appType]",
})
export class TypeDirective {
  constructor(@Attribute("type") private inputType: string) {
    if (inputType === "text") {
      // ...
    } else {
      // ...
    }
  }
}
```

---

# Directive Composition API

- Cette API permet d'activer des **directives** existantes sur le **host** d'un composant
- Et ainsi bénéficier de toutes les fonctionnalités de ces **directives**

```typescript
@Component({
  selector: "app-toggle",
  hostDirectives: [
    {
      directive: DisableDirective,
      inputs: ["disableState: disabled"],
    },
    {
      directive: ColorDirective,
      inputs: ["color"],
    },
  ],
  template: `<label class="switch">
    <input type="checkbox" />
    <span class="slider"></span>
  </label> `,
})
export class ToggleComponent {}
```

```html
<app-toggle [disabled]="false" color="secondary"></app-toggle>
```
