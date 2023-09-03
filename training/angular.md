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

# IDE

* Plusieurs IDE peuvent être utilisée pour écrire du code TypeScript
  * WebStorm
  * Intellij IDEA
  * Visual Studio Code
    * ajout de l'extension **yoavbls.pretty-ts-errors**

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

# @Attribute

* Dans une directive, si vous souhaitez récupérer, en lecture seule, la valeur d'un attribut présent sur l'élément sur lequel vous avez mis la directive, vous pouvez utiliser la directive **@Attribute**

```typescript
import { Directive, Attribute } from '@angular/core'
@Directive({
  selector: '[appType]'
})
export class TypeDirective {
  constructor( @Attribute('type') private inputType: string) {
    if(type === 'text'){
      // ...
    } else {
      // ...
    }
  }
}
```

---

---
layout: cover
---

# Forms

---

# Template Driven Form

---

# Reactive Form

---

# Custom Validators

* Nous pouvons créer nos propres validateurs
  * Doit étendre la classe **Validator**
  * Doit implémenter la classe **Validate**
  * Doit s'autoenregistrer dans le token **NG_VALIDATORS**

```typescript
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
  selector('[ageMin]'),
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: AgeMinDirective,
    multi: true
  }]
})
export class AgeMinDirective extends Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if(control.value === null || control.value === ''){
      return null;
    }

    if(Integer(control.value) > 18){
      return null;
    }

    return {
      ageMin: {
        ageTooYoung: true
      }
    }
  }
}
```

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

# Stratégies

* Nous avons plusieurs stratégies pour définir des *provider*
  * useClass
  * useFactory
  * useValue
  * useExisting

---

# InjectionToken

* Si le *provider* n'est pas défini via un classe, nous pouvons utiliser la classe `InjectionToken`

```typescript
import { NgModule, InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('api_url');


@Component({
  providers: [ { provide: API_URL, useValue: 'http://api'}]
})
export class AppComponent {

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

# Router - Guard

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

# Router - Guard

* Pour configurer un guard fontionnel, vous pouvez par exemple créer une **factory** grâce à laquelle nous pourrons définir le paramètrage. 

```typescript
export const roleGuard = (role: 'MANAGER' | 'ADMIN'): CanActivateFn => {
  const guard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const hasAccess = authService.hasRole(role);
    return hasAccess ? true : router.createUrlTree(['/unauthorized']);
  };

  return guard;
};

export const routes: Routes = [
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [roleGuard(ROLES.ADMIN)],
  },
  { 
    path: 'manager', 
    component: ManagerComponent,
    canActivate: [roleGuard(ROLES.MANAGER)],
  },
];
```

---

# Resolver

* Un rsolver est un mécanisme permettant 
  * d'aller récupérer la donnée nécessaire pour une page
  * de le faire avant la redirection vers cette même page
  * d'éviter de le faire dans le composant lui-même 

```typescript
@Injectable({ providedIn: 'root' })
export class ProductResolver implements Resolve<Observable<Product>> {
  constructor(
      private service: ProductService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Product>{
    const productId = this.route.snapshot.paramMap.get('productId');
    
    return this.service.getProduct(productId);
  }
}
```

---

# Resolver

* Pour enregistrer ce resolver, nous devons le définir dans la configuration de la route

```typescript
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductComponent } from '../products/product.component';
import { ProductResolver } from '../product.resolver';
import { CanActivateGuard } from '../core/guards/can-activate.guard';

const routes: Routes = [
    {
        path: 'product/:productId',
        component: ProductComponent,
        resolve: {
            product: ProductResolver
        }
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
```

---


# Resolver

* Dernière étape, nous allons récupérer ces données depuis les composants grâce à l'observable data de l'objet **ActivatedRoute**

```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../shared/models/products.model';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
    public product: Product;
    private productSubscription: Subscription;

    constructor(
        private productsService: ProductsService,
        private route: ActivatedRoute,
    ) {
      this.productSubscription = this.route.data.subscribe((data) => {
            this.product = data.product;
        });
    }

    ngOnDestroy() {
      this.productSubscription?.unsubscribe();
    }
}
```
---

# Named Outlet

* Nous pouvons avoir plusieurs *outlet* 
  * Celle par défaut sera nomméé **primary**

```typescript
const routes: Routes= [{
  path: 'products/:id', component: ProductListComponent
}, {
  path: 'products/:id', component:ProductSidebarComponent,outlet:'sidebar'
}];
```

```html
<a
  [routerLink]="[{ 
    outlets: { 
      primary: ['products', '1'], 
      sidebar: ['products', '1'] 
    } 
  }]"
  >Product</a
>
<div class="row">
  <div class="col-8">
    <router-outlet></router-outlet>
  </div>
  <div class="col-4">
    <router-outlet name="sidebar"></router-outlet>
  </div>
</div>
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
