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
  ## Angular
  Angular training — templates, components, forms, services, RxJS, HTTP and the router.

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

<div style="opacity: 0.75; font-size: 0.9em;">Templates, composants, formulaires, services, RxJS, HTTP et le router</div>

<br />
<br />

<div style="display: flex; justify-content: center; align-items: center;">
  <div>
    <img src="/images/authors/Manu.jpeg" alt="Manu" height="150" width="150" />
    <div>
      <a href="https://github.com/emmanueldemey" target="_blank" rel="noopener noreferrer">Emmanuel Demey</a>
    </div>
  </div>
</div>

---

# IDE

- Plusieurs IDE peuvent être utilisés pour écrire du code TypeScript
  - WebStorm
  - Intellij IDEA
  - Visual Studio Code
    - ajout de l'extension **yoavbls.pretty-ts-errors**

---
layout: cover
---

# Dynamisation HTML

---

# Control Flow

- Depuis Angular 17, nous avons à notre disposition des nouvelles syntaxes pour dynamiser un template

  - **@if** **else**
  - **for**

- Ces syntaxes remplacent le système de directives structurelles ngIf, ngFor ou ngSwitch

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
@switch (condition) { @case (caseA) { Case A. } @case (caseB) { Case B. }
@default { Default case. } }
```

---

# For

- Directive permettant d'itérer sur une collection
- Elle propose plusieurs propriétés permettant d'avoir des informations sur l'itération en cours.

```typescript
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <ul>
      @for (
        person of people;
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
  people = [{ id: 0, label: "Joe" }];
}
```

---
layout: cover
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
layout: cover
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

- Cet API permet d'activer des **directives** existantes sur le **host** d'un composat
- Et ainsi bénécier de tout le fonctionnelle de ces **directives**

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

---
layout: cover
---

# Forms

---

# Template Driven Form

- L'état du formulaire est décrit dans le **template**, via la directive **ngModel**
- Nécessite l'import du module **FormsModule**
- Simple à mettre en place, mais difficile à tester et à composer

```typescript
@Component({
  imports: [FormsModule],
  template: `
    <form #form="ngForm" (ngSubmit)="submit(form.value)">
      <input name="email" [(ngModel)]="email" required email />
      <button type="submit" [disabled]="form.invalid">Envoyer</button>
    </form>
  `,
})
export class FormComponent {
  email = "";
}
```

- Pour tout le reste, préférez les **Reactive Forms**

---

# Reactive Form

- Plusieurs méthodes sont à votre disposition sur l'objet _FormGroup_

```typescript
@Component({ ... })
export class FormComponent {
  form = inject(FormBuilder).group({
    name: ['Emeline'],
    email: [{ value: 'emeline@gmail.com', disabled: true }]
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
  - Doit implémenter l'interface **Validator**, donc la méthode **validate**
  - Doit s'enregistrer dans le token **NG_VALIDATORS**, en mode **multi**

```typescript
import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[ageMin]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: AgeMinDirective,
    multi: true
  }]
})
export class AgeMinDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if(control.value === null || control.value === ''){
      return null;
    }

    if(Number(control.value) > 18){
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
layout: cover
---

# Services

---

# Services

- Angular met à disposition un système d'_Injection de Dépendance_
- Un service est une simple classe permettant d'implémenter la couche métier de l'application.

```typescript
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UserService {
  getUser(id: string): User {}

  getUsers(): User[] {}
}
```

---

# Service

- Deux solutions sont disponibles pour injecter ces services
  - Via le constructeur d'un composant/directive/service

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
import { InjectionToken } from "@angular/core";

export const API_URL = new InjectionToken<string>("api_url");

@Component({
  providers: [{ provide: API_URL, useValue: "http://api" }],
})
export class AppComponent {}
```

```typescript
import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "./api-url.token";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(
    private http: HttpClient,
    @Inject(API_URL) private apiUrl: string
  ) {}

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
      useFactory: (service: FeatureFlagService) =>
        service.initializeFeatureFlags(),
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

- Introduite en _Developer Preview_ dans Angular 16, l'API des **Signals** est stable depuis Angular 17
  - signal
  - computed
  - input
  - viewChild, viewChildren, contentChild, contentChildren
  - resource, linkedSignal — plus récentes, encore expérimentales

---
layout: cover
---

# RxJS

---

# RxJS

- Voici quelques exemples d'opérateurs

- `of`
- `map` et `filter`
- `switchMap`
- `catchError`
- `tap`
- `takeUntil`
- `debounceTime`
- `distinctUntilChanged`
- `combineLatest`

---

# `of`

- Crée un Observable à partir de valeurs déjà connues
- Il émet chaque valeur, puis complète immédiatement
- Très utile dans les tests, et comme valeur de repli dans un **catchError**

```typescript
import { of } from "rxjs";

of(1, 2, 3).subscribe(console.log); // 1, 2, 3, puis complete
```

---

# `map` et `filter`

- **map** transforme chaque valeur émise
- **filter** ne laisse passer que les valeurs qui respectent un prédicat
- Ce sont les équivalents des méthodes du même nom sur les tableaux, mais dans le temps

```typescript
this.http.get<PeopleResponse>(url).pipe(
  map((response) => response.results),
  map((people) => people.filter((person) => person.gender === "male"))
);
```

---

# `switchMap`

- Permet de passer d'un Observable à un autre, à partir de la valeur reçue
- À chaque nouvelle valeur, il **annule** l'Observable précédent
- C'est l'opérateur des recherches : la réponse d'une requête obsolète ne peut plus écraser la plus récente

```typescript
this.search.valueChanges.pipe(
  switchMap((term) => this.http.get<PeopleResponse>(`/people/?search=${term}`))
);
```

- **mergeMap** exécute tout en parallèle, **concatMap** met en file d'attente, **exhaustMap** ignore les nouvelles valeurs tant que la précédente n'est pas terminée

---

# `catchError`

- Intercepte une erreur et retourne un **nouvel** Observable
- Sans lui, la première erreur termine le flux : le formulaire de recherche ne répond plus

```typescript
this.http.get<PeopleResponse>(url).pipe(
  catchError((error: HttpErrorResponse) => {
    console.error(error.status);
    return of({ count: 0, next: null, previous: null, results: [] });
  })
);
```

- À placer sur la requête interne (dans le **switchMap**), et non à la fin du pipe, si le flux doit survivre à l'erreur

---

# `tap`

- Exécute un effet de bord sans modifier les valeurs qui traversent le flux
- Journalisation, indicateur de chargement, mise en cache

```typescript
this.http.get<PeopleResponse>(url).pipe(
  tap(() => (this.loading = true)),
  map((response) => response.results),
  tap(() => (this.loading = false))
);
```

---

# `takeUntil`

- Complète le flux dès qu'un autre Observable émet
- C'est la manière historique de se désabonner à la destruction d'un composant

```typescript
private destroy$ = new Subject<void>();

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

- Depuis Angular 16, **takeUntilDestroyed** fait la même chose sans le Subject

```typescript
source$.pipe(takeUntilDestroyed()).subscribe();
```

---

# `debounceTime`

- N'émet une valeur que si aucune autre n'est arrivée pendant le délai indiqué
- Une requête par pause de frappe, et non une par caractère

```typescript
this.search.valueChanges.pipe(
  debounceTime(300),
  switchMap((term) => this.http.get(`/people/?search=${term}`))
);
```

---

# `distinctUntilChanged`

- Ignore une valeur identique à la précédente
- Effacer puis retaper le même caractère ne déclenche plus de seconde requête
- Un comparateur peut être fourni pour les objets

```typescript
this.search.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((term) => this.http.get(`/people/?search=${term}`))
);
```

---

# `combineLatest`

- Combine les **dernières** valeurs de plusieurs Observables
- N'émet qu'une fois que chaque source a émis au moins une valeur

```typescript
combineLatest([this.search$, this.page$]).pipe(
  switchMap(([term, page]) =>
    this.http.get(`/people/?search=${term}&page=${page}`)
  )
);
```

---
layout: cover
---

# Http

---

# HttpClient

- Le client HTTP est fourni au niveau de l'application, via **provideHttpClient**
- Chaque méthode retourne un **Observable** : rien n'est envoyé tant que personne ne s'abonne

```typescript
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};
```

```typescript
@Injectable({ providedIn: "root" })
export class UserService {
  private http = inject(HttpClient);

  getUsers(search: string): Observable<User[]> {
    return this.http
      .get<UsersResponse>("/api/users", { params: { search } })
      .pipe(map((response) => response.results));
  }
}
```

---

# Http Interceptors

- Nous pouvons définir des intercepteurs afin de manipuler les requêtes et réponses HTTP

```typescript
import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { retry, RetryConfig } from "rxjs";

export const retryInterceptor =
  (config: RetryConfig) => (req: HttpRequest<unknown>, next: HttpHandlerFn) =>
    next(req).pipe(retry(config));

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([retryInterceptor({ count: 1 })])),
  ],
}).catch((error) => console.error(error));
```

---
layout: cover
---

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

- Nous ne sommes pas limités à un seul niveau de routes.
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
- Le _bundle_ initial en sera donc réduit. Un gain en terme de performance sera détectable.
- **loadComponent** pour une page, **loadChildren** pour un groupe de routes

```typescript
const routes: Routes = [
  {
    path: "admin",
    loadComponent: () => import("./admin/admin").then((m) => m.Admin),
  },
  {
    path: "billing",
    loadChildren: () =>
      import("./billing/billing.routes").then((m) => m.BILLING_ROUTES),
  },
];
```

---

# Router - Guard

- Nous pouvons définir des **guards** afin de savoir si nous pouvons ou pas faire certaines choses avant un changement de page
  - `canActivate`
  - `canActivateChild`
  - `canDeactivate`
  - `canLoad` (déprécié depuis Angular 15, remplacé par `canMatch`)
  - `canMatch`

```typescript
const routes: Routes = [
  {
    path: "admin",
    canActivate: [() => inject(LoginService).isLoggedIn()],
  },
  {
    path: "edit",
    component: EditCmp,
    canDeactivate: [(component: EditCmp) => !component.hasUnsavedChanges],
  },
];
```

---

# Router - Guard

- Pour configurer un guard fonctionnel, vous pouvez par exemple créer une **factory** grâce à laquelle nous pourrons définir le paramétrage.

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

- Un resolver est un mécanisme permettant
  - d'aller récupérer la donnée nécessaire pour une page
  - de le faire avant la redirection vers cette même page
  - d'éviter de le faire dans le composant lui-même

```typescript
@Injectable({ providedIn: "root" })
export class ProductResolver implements Resolve<Product> {
  private service = inject(ProductService);

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Product> {
    const productId = route.paramMap.get("productId");

    return this.service.getProduct(productId);
  }
}
```

---

# Resolver

- Pour enregistrer ce resolver, nous devons le définir dans la configuration de la route

```typescript
import { Routes } from "@angular/router";

import { ProductComponent } from "../products/product.component";
import { ProductResolver } from "../product.resolver";

export const routes: Routes = [
  {
    path: "product/:productId",
    component: ProductComponent,
    resolve: {
      product: ProductResolver,
    },
  },
];
```

- Un resolver peut aussi être une simple fonction — **ResolveFn** — plutôt qu'une classe

```typescript
export const productResolver: ResolveFn<Product> = (route) =>
  inject(ProductService).getProduct(route.paramMap.get("productId"));
```

---

# Resolver

- Dernière étape, nous allons récupérer ces données depuis les composants grâce à l'observable data de l'objet **ActivatedRoute**

```typescript
import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Product } from "../shared/models/products.model";

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.scss"],
})
export class ProductComponent implements OnDestroy {
  public product: Product;
  private productSubscription: Subscription;

  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute
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

# Guards et Resolvers

- Nous pouvons configurer à quel moment les guards et resolvers doivent s'exécuter.
- Plusieurs valeurs sont possibles
  - always
  - paramsChange
  - paramsOrQueryParamsChange
  - pathParamsChange
  - pathParamsOrQueryParamsChange

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
  - Celui par défaut est nommé **primary**

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

# Tests Unitaires

- Pourquoi Jest et Testing Library ?

- Jest :

  - Framework de test JavaScript populaire.
  - Prise en charge de l'ensemble du cycle de vie du test.
  - Simple à configurer et à utiliser.

- Testing Library :
  - Met l'accent sur le test de comportement utilisateur.
  - Facilite la création de tests plus robustes et maintenables.
  - Encourage les tests orientés utilisateur.

```typescript
import { render } from "@testing-library/angular";
import { MyComponent } from "./my-component.component";

describe("MyComponent", () => {
  test("renders component with correct text", async () => {
    const { getByText } = await render(MyComponent);
    expect(getByText("Hello, World!")).toBeTruthy();
  });
});
```

---

# Tests E2E

- Historiquement, Angular proposait une intégration de **Protractor**
- **Protractor** est à présent déprécié, mais Angular propose des intégrations à des solutions connues
  - Cypress
  - Nightwatch

```shell
npx @angular/cli e2e
```
