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

- Si le _provider_ n'est pas défini via une classe, nous pouvons utiliser la classe `InjectionToken`

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
