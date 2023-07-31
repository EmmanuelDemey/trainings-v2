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

# Composants 

---

# Composants Standalone

* Angular propose une nouvelle solution pour activer les composants globalement via les **Standalone component**
* Avant, nous étions obligé d'utiliser des **ngModule**

```typescript
@Component({
  selector: 'app-foo',
  standalone: true,
  templateUrl: './foo.component.html',
})
export class FooComponent {
           👇
}
```

---

# Input obligatoires

* Depuis **Angular 16**, nous pouvons définir que des *input* sont obligatoires. 

```typescript
@Component({
  selector: 'app-error',
  standalone: true,
  templateUrl: './error.component.html',
})
export class ErrorMessage {
           
  @Input({ required: true }) error: string;

}
```
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

# ngFor - trackBy

* Syntaxe permettant d'identifier un élément dans la liste de données manipulée par le **ngFor**
* Permet d'améliorer les performances de l'application 

```html
<li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>
```

```typescript
class Component {
  public userTrackBy(index, user) {
    return user.id;
  }
}
```

---

# NgSwitch

---

---
layout: cover
---

# Services

---

# Services 

* Angular met à disposition un système d'*Injection de Dépendance*
* Un service est une simple classe permettant d'implémenter la couche métier de l'application. 

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  provideIn: 'root'
})
export class UserService {

  getUser(id: string): User {

  }

  getUsers(): User[] {
    
  }
}
```

---

# Service

* Deux solutions sont disponibles pour injecter ces services
  * Via la constructeur d'un composant/directive/services

```typescript
import { Component } from '@angular/core';
import { UserService } from './user.service';

@Component({})
export class UserProfilComponent {

  constructor(private userService: UserService){

  }
}
```

  * via l'utilisation de la nouvelle méthode `inject`

```typescript
import { Component, inject } from '@angular/core';
import { UserService } from './user.service';

@Component({})
export class UserProfilComponent {
  userService = inject(UserService);
}
```

---

# InjectionToken

* Si le *provider* n'est pas défini via un classe, nous pouvons utiliser la classe `InjectionToken`

```typescript
import { NgModule, InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('api_url');


@NgModule({
  providers: [ { provide: API_URL, useValue: 'http://api'}]
})
export class AppModule {

}
```

```typescript
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './app.module';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string) { }

  getUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }
}
```

---

# State Container 

* Si vous souhaitez utiliser des librairies similaires à l'écosystème Redux en React, nous pouvons utiliser 
  * Akita
  * NGXS
  * NGRX

---

# Reactivité - Signals


* Depuis Angular 16, l'API des **Signals** est en *Developer Preview*

---

---
layout: cover
---

# RxJS

---

# RxJS

* Voici des examples d'operateurs

* `of`
* `map` et `filter`
* `switchMap`
* `catchError`
* `tap`
* `takeUntil`
* `debounceTime`
* `disctingUntilChanged`
* `combineLatest`

---

# `of`

---

# `map` et `filter`

---

# `switchMap`

---

# `catchError`

---

# `tap`

---

# `takeUntil`

---

# `debounceTime`

---

# `disctingUntilChanged`

---

# `combineLatest`

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

---

---
layout: cover
---

# Router

---

# Router - @Input

* Nous pouvons *mapper* la configuration du router à des `Input` du composant (*page*)
* Pour cela,  nous allons utiliser la méthode `withComponentInputBinding` lors de la configuration du Router

```typescript
const routes: Routes = [
  {
    path: "search/:id",
    component: SearchComponent,
    data: { title: "Search" },
    resolve: { searchData: SearchDataResolver }
  },
];

bootstrapApplication(App, {
  providers: [
    provideRouter(routes, 
        withComponentInputBinding()
    )
  ],
});
```

```typescript
@Component({})
export class SearchComponent implements OnInit {
    @Input() query?: string; 
    @Input('id') pathId?: string; 
    @Input('title') dataTitle?: string;
    @Input('searchData') resolvedData?: any; 

    ngOnInit() {  }
}
```
---

# Router

* Nous pouvons définir des **guards** afin de savoir si nous pouvons ou pas faire certaines choses avant un changement de page
  * `canActivate`
  * `canActivateChild`
  * `canDeactivate`
  * `canLoad`
  * `canMatch`

```typescript
const routes = [
  {
    path: ‘admin’,
    canActivate: [() => inject(LoginService).isLoggedIn()]
  },
  {
    path: ‘edit’,
    component: EditCmp,
    canDeactivate: [
      (component: EditCmp) => !component.hasUnsavedChanges
    ]
  }
];
```

---

# Tests E2E

* Historiquement, Angular proposé une intégration de **Protractor**
* **Protractor** est à présent déprécié, mais Angular propose des intégrations à des solutions connues
** Cypress
** Nighwatch

```shell
npx @angular/cli e2e
```
