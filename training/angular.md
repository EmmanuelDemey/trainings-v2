---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
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

# Angular

---

---
layout: cover
---

# Directives

---
# Structural Directives

---

# NgIf

---

# NgFor

* Directive permettant d'itérer sur une collection
* Elle propose plusieurs propriétés permetttant d'avoir des informations sur l'itération en cours. 

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <ul>
      <li *ngFor="let person of people; index as i; first as isFirst; last as isLast; odd as isOdd; even as isEven">
        {{ person }} {{ i }} {{ isFirst }} {{ isLast }} {{ isOdd }} {{ isEven }}
      </li>
    </ul>
  `
})
export class RootComponent {
  people: string[] = ["Joe", "John"]
}
```

---

# NgSwitch

---

---
layout: cover
---

# RxJS

---

# RxJS

* Voici des examples d'operateurs

* `of`
* `interval`
* `combineLatest`
* `merge`
* `map`
* `disctingUntilChanged`
* `mergeMap` ou `switchMap`
* `tap`
* `takeUntil`

---
layout: cover
---

# Http

---

# Http Interceptors

* Nous pouvons définir ds intercepteurs afin de manipuler les requêtes et réponses HTTP

```typescript
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import { retry, RetryConfig } from 'rxjs';

export const retryInterceptor = (config: RetryConfig) => (req: HttpRequest<unknown>, next: HttpHandlerFn) => next(req).pipe(retry(config));

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([retryInterceptor({ count: 1})]))
  ]
}).catch(error => console.error(err));
```
