---
layout: cover
---

# Http

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
