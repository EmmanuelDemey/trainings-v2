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
- Le _bundle_ intial en sera donc réduit. Un gain en terme de performance sera détectable.

```typescript
const routes: Routes = [
  {
    path: "admin",
    loadComponent: () =>
      import("./admin/admin.component").then((c) => c.AdminComponent),
  },
  // Ou pour charger un ensemble de routes enfants :
  {
    path: "settings",
    loadChildren: () =>
      import("./settings/settings.routes").then((r) => r.SETTINGS_ROUTES),
  },
];
```

---

# Router - Guard

- Nous pouvons définir des **guards** afin de savoir si nous pouvons ou pas faire certaines choses avant un changement de page
  - `canActivate`
  - `canActivateChild`
  - `canDeactivate`
  - `canMatch` (remplace l'ancien `canLoad`, déprécié)

```typescript
const routes = [
  {
    path: 'admin',
    canActivate: [() => inject(LoginService).isLoggedIn()]
  },
  {
    path: 'edit',
    component: EditCmp,
    canDeactivate: [
      (component: EditCmp) => !component.hasUnsavedChanges
    ]
  }
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
// Resolver fonctionnel (recommandé depuis Angular 15.1)
export const productResolver: ResolveFn<Product> = (route) => {
  const service = inject(ProductService);
  const productId = route.paramMap.get("productId");
  return service.getProduct(productId!);
};
```

---

# Resolver

- Pour enregistrer ce resolver, nous devons le définir dans la configuration de la route

```typescript
import { Routes } from "@angular/router";
import { ProductComponent } from "../products/product.component";
import { productResolver } from "../product.resolver";

const routes: Routes = [
  {
    path: "product/:productId",
    component: ProductComponent,
    resolve: {
      product: productResolver,
    },
  },
];

// Dans app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```

---

# Resolver

- Dernière étape, nous allons récupérer ces données depuis les composants.
- Grâce à `withComponentInputBinding()`, les données du resolver sont directement mappées sur les `@Input()` du composant.

```typescript
import { Component, Input } from "@angular/core";
import { Product } from "../shared/models/products.model";

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.scss"],
})
export class ProductComponent {
  // Le nom doit correspondre à la clé définie dans `resolve: { product: ... }`
  @Input() product!: Product;
}
```

- N'oubliez pas d'activer `withComponentInputBinding()` dans la configuration du router :

```typescript
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withComponentInputBinding())],
};
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
  - Celle par défaut sera nommée **primary**

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
