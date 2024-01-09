---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: "text-center"
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

- Plusieurs IDE peuvent être utilisée pour écrire du code TypeScript
  - WebStorm
  - Intellij IDEA
  - Visual Studio Code
    - ajout de l'extension **yoavbls.pretty-ts-errors**

---

## layout: cover

# Dynamisation HTML

---

# Control Flow

* Depuis Angular 17, nous avons à notre disposition des nouvelels syntaxes pour dynamiser un template 
  * **@if** **else**
  * **for**

* Ces syntaxes remplacent le système de directives structurelles ngIg, ngFor ou ngSwitch

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
- Elle propose plusieurs propriétés permetttant d'avoir des informations sur l'itération en cours.

```typescript
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <ul>
      @for (person of people; let i = $index; let isFirst = $first; let isLast = $last; let isOdd = $odd; let isEven = $even) {
        <li>{{ person }} {{ i }} {{ isFirst }} {{ isLast }} {{ isOdd }} {{ isEven }}</li>
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

- Syntaxe permettant d'identifier un élément dans la liste de données manipulée par le **ngFor**
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
  people: string[] = [{id: 0, label: "Joe"}];
}
```

---

# Composants

---

# Composants Standalone

- Angular propose une nouvelle solution pour activer les composants globalement via les **Standalone component**
- Avant, nous étions obligé d'utiliser des **ngModule**

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

- Depuis **Angular 16**, nous pouvons définir que des _input_ sont obligatoires.

```typescript
@Component({
  selector: "app-error",
  standalone: true,
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
    if (type === "text") {
      // ...
    } else {
      // ...
    }
  }
}
```

---

---

## layout: cover

# Forms

---

# Template Driven Form

---

# Reactive Form

- Plusieurs méthodes sont à votre disposition sur l'objet _FormGroup_

```typescript
@Component({ ... })
export class FormComponent {
  form = inject(FormBuilder).group({
    name: ['Emeline'],
    email: ['emeline@gmail.com', { disabled: true }]
  })

  constructor(){
    console.log(this.form.value); // { name: 'Emeline' }
    console.log(this.form.getRawValue()); // { name: 'Emeline', email: 'emeline@gmail.com' }
  }
}
```

---

# Custom Validators

- Nous pouvons créer nos propres validateurs
  - Doit étendre la classe **Validator**
  - Doit implémenter la classe **Validate**
  - Doit s'autoenregistrer dans le token **NG_VALIDATORS**

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

## layout: cover

# Services

---

# Services

- Angular met à disposition un système d'_Injection de Dépendance_
- Un service est une simple classe permettant d'implémenter la couche métier de l'application.

```typescript
import { Injectable } from "@angular/core";

@Injectable({
  provideIn: "root",
})
export class UserService {
  getUser(id: string): User {}

  getUsers(): User[] {}
}
```

---

# Service

- Deux solutions sont disponibles pour injecter ces services
  - Via la constructeur d'un composant/directive/services

```typescript
import { Component } from "@angular/core";
import { UserService } from "./user.service";

@Component({})
export class UserProfilComponent {
  constructor(private userService: UserService) {}
}
```

- via l'utilisation de la nouvelle méthode `inject`

```typescript
import { Component, inject } from "@angular/core";
import { UserService } from "./user.service";

@Component({})
export class UserProfilComponent {
  userService = inject(UserService);
}
```

---

# Stratégies

- Nous avons plusieurs stratégies pour définir des _provider_
  - useClass
  - useFactory
  - useValue
  - useExisting

---

# InjectionToken

- Si le _provider_ n'est pas défini via un classe, nous pouvons utiliser la classe `InjectionToken`

```typescript
import { NgModule, InjectionToken } from "@angular/core";

export const API_URL = new InjectionToken<string>("api_url");

@Component({
  providers: [{ provide: API_URL, useValue: "http://api" }],
})
export class AppComponent {}
```

```typescript
import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "./app.module";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient, @Inject(API_URL) private apiUrl: string) {}

  getUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }
}
```

---

# makeEnvironmentProviders

- Depuis Angular 15, nous pouvons créer nos propres APIs compatibles avec l'API Standalone.
- Pour cela, il faudra utiliser la méthode **makeEnvironmentProviders**

```typescript
export function provideFeatureFlags(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      useFactory: (service: FeatureFlagService) => service.initializeFeatureFlags(),
      deps: [FeatureFlagService],
      multi: true,
    },
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [provideFeatureFlags()],
};
```

---

# State Container

- Si vous souhaitez utiliser des librairies similaires à l'écosystème Redux en React, nous pouvons utiliser
  - Akita
  - NGXS
  - NGRX

---

# Reactivité - Signals

- Depuis Angular 16, l'API des **Signals** est en _Developer Preview_

---

---

## layout: cover

# RxJS

---

# RxJS

- Voici des examples d'operateurs

- `of`
- `map` et `filter`
- `switchMap`
- `catchError`
- `tap`
- `takeUntil`
- `debounceTime`
- `disctingUntilChanged`
- `combineLatest`

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

## layout: cover

# Http

---

# Http Interceptors

- Nous pouvons définir ds intercepteurs afin de manipuler les requêtes et réponses HTTP

```typescript
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { retry, RetryConfig } from "rxjs";

export const retryInterceptor = (config: RetryConfig) => (req: HttpRequest<unknown>, next: HttpHandlerFn) =>
  next(req).pipe(retry(config));

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([retryInterceptor({ count: 1 })]))],
}).catch((error) => console.error(err));
```

---

---

## layout: cover

# Router

---

# Router - @Input

- Nous pouvons _mapper_ la configuration du router à des `Input` du composant (_page_)
- Pour cela, nous allons utiliser la méthode `withComponentInputBinding` lors de la configuration du Router

```typescript
const routes: Routes = [
  {
    path: "search/:id",
    component: SearchComponent,
    data: { title: "Search" },
    resolve: { searchData: SearchDataResolver },
  },
];

bootstrapApplication(App, {
  providers: [provideRouter(routes, withComponentInputBinding())],
});
```

```typescript
@Component({})
export class SearchComponent implements OnInit {
  @Input() query?: string;
  @Input("id") pathId?: string;
  @Input("title") dataTitle?: string;
  @Input("searchData") resolvedData?: any;

  ngOnInit() {}
}
```

---

# Nested Routes

- Nous ne sommes pas limiter à un seul niveau de routes.
- Nous pouvons avoir plusieurs **router-outlet** imbriqués.
- Pour cela, nous allons définir des routes imbriquées.

```typescript
const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
    children: [
      { path: "overview", component: OverviewComponent },
      { path: "statistics", component: StatisticsComponent },
    ],
  },
];
```

---

# Lazy Loading

- Le mécanisme de **Lazy Loading** permet de télécharger le code JavaScript d'une page, seulement si nous allons sur cette page
- Le _bundle_ intial en sera donc réduit. Un gain en terme de performance sera détectable.

```typescript
const routes: Routes = [
  {
    path: "admin",
    loadChildren: () => import("./admin/admin.module").then((m) => m.AdminModule),
  },
];
```

---

# Router - Guard

- Nous pouvons définir des **guards** afin de savoir si nous pouvons ou pas faire certaines choses avant un changement de page
  - `canActivate`
  - `canActivateChild`
  - `canDeactivate`
  - `canLoad`
  - `canMatch`

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

- Pour configurer un guard fontionnel, vous pouvez par exemple créer une **factory** grâce à laquelle nous pourrons définir le paramètrage.

```typescript
export const roleGuard = (role: "MANAGER" | "ADMIN"): CanActivateFn => {
  const guard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const hasAccess = authService.hasRole(role);
    return hasAccess ? true : router.createUrlTree(["/unauthorized"]);
  };

  return guard;
};

export const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [roleGuard(ROLES.ADMIN)],
  },
  {
    path: "manager",
    component: ManagerComponent,
    canActivate: [roleGuard(ROLES.MANAGER)],
  },
];
```

---

# Router - Guard - CanMatch

- Le guard _canMatch_ peut être utile si vous souhaitez activer une route même si deux objets de configuration utilisent le même _path_

```typescript
export const routes: Routes = [
  {
    path: "room",
    component: AdminComponent,
    canMatch: [roleGuard(ROLES.TEACHER)],
  },
  {
    path: "room",
    component: ManagerComponent,
    canMatch: [roleGuard(ROLES.STUDENT)],
  },
];
```

---

# Resolver

- Un rsolver est un mécanisme permettant
  - d'aller récupérer la donnée nécessaire pour une page
  - de le faire avant la redirection vers cette même page
  - d'éviter de le faire dans le composant lui-même

```typescript
@Injectable({ providedIn: "root" })
export class ProductResolver implements Resolve<Observable<Product>> {
  constructor(private service: ProductService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Product> {
    const productId = this.route.snapshot.paramMap.get("productId");

    return this.service.getProduct(productId);
  }
}
```

---

# Resolver

- Pour enregistrer ce resolver, nous devons le définir dans la configuration de la route

```typescript
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ProductComponent } from "../products/product.component";
import { ProductResolver } from "../product.resolver";
import { CanActivateGuard } from "../core/guards/can-activate.guard";

const routes: Routes = [
  {
    path: "product/:productId",
    component: ProductComponent,
    resolve: {
      product: ProductResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

---

# Resolver

- Dernière étape, nous allons récupérer ces données depuis les composants grâce à l'observable data de l'objet **ActivatedRoute**

```typescript
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Product } from "../shared/models/products.model";

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.scss"],
})
export class ProductComponent implements OnInit, OnDestroy {
  public product: Product;
  private productSubscription: Subscription;

  constructor(private productsService: ProductsService, private route: ActivatedRoute) {
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

# Guards et Resolvers

* Nous pouvons configurer à quel moment les guards et resolvers doivent s'exécuter. 
* Plusieurs valeurs sont possibles 
  * always
  * paramsChange
  * paramsOrQueryParamsChange
  * pathParamsChange
  * pathParamsOrQueryParamsChange

```typescript
const routes: Routes = [
  {
    path: "product/:productId",
    component: ProductComponent,
    runGuardsAndResolvers: "always",
    resolve: {
      product: ProductResolver,
    },
  },
];

```

---

# Named Outlet

- Nous pouvons avoir plusieurs _outlet_
  - Celle par défaut sera nomméé **primary**

```typescript
const routes: Routes = [
  {
    path: "products/:id",
    component: ProductListComponent,
  },
  {
    path: "products/:id",
    component: ProductSidebarComponent,
    outlet: "sidebar",
  },
];
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

- Historiquement, Angular proposé une intégration de **Protractor**
- **Protractor** est à présent déprécié, mais Angular propose des intégrations à des solutions connues
  ** Cypress
  ** Nighwatch

```shell
npx @angular/cli e2e
```
