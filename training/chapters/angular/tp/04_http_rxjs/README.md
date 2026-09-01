# TP 4 — RxJS and HTTP

> Deck sections **RxJS** and **Http**. ~1h15. Continues the project of
> workshop 3.

## Goal

Replace the in-memory array with a real API, and drive the search from the
server. By the end you can:

- provide and inject `HttpClient`, and type what comes back
- read an `Observable` in a template without subscribing by hand
- compose a search pipeline with `debounceTime`, `distinctUntilChanged` and
  `switchMap` — and say what each one prevents
- handle the failure case, which is the half everyone skips

## The API

[SWAPI](https://swapi.dev/) — the Star Wars API. No key, no signup, CORS open.

| | |
|---|---|
| All characters | `https://swapi.dev/api/people/` |
| Search | `https://swapi.dev/api/people/?search=r2` |
| One page | `https://swapi.dev/api/people/?page=2` |

The response wraps the array — 82 characters, ten per page:

```json
{
  "count": 82,
  "next": "https://swapi.dev/api/people/?page=2",
  "previous": null,
  "results": [ { "name": "Luke Skywalker", "...": "..." } ]
}
```

> If `swapi.dev` is unreachable from your network, `https://swapi.info/api/people`
> (the whole array, unpaginated) and `https://swapi.tech/api/people` are mirrors
> with slightly different shapes. Check with `curl` before blaming your code.

## Prerequisites

- Workshop 3 finished: three components, and a filter that works in memory

## Setup

```shell
cd first-project
npm start
```

## Steps

### 1. Provide `HttpClient` — `src/app/app.config.ts`

```ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};
```

Nothing works without this, and the error you get when you forget it —
`NullInjectorError: No provider for HttpClient!` — is worth causing once on
purpose.

> **No `withFetch()`.** Since Angular 22 the client is built on `fetch`, so that
> option is the default and the function is deprecated. Older instructions add it;
> on this version it does nothing. You can see it for yourself in the Network tab —
> the requests are `fetch`, not `xhr`.

### 2. Type the response — `src/app/person.ts`

```ts
export interface PeopleResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Person[];
}
```

### 3. The first call — `src/app/app.ts`

Delete the static `people` array. Inject the client and fetch:

```ts
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';

export class App {
  private http = inject(HttpClient);

  people$ = this.http
    .get<PeopleResponse>('https://swapi.dev/api/people/')
    .pipe(map((response) => response.results));
}
```

Render it with the `async` pipe, which subscribes and unsubscribes for you:

```html
@if (people$ | async; as people) {
  <app-people-table [people]="people" />
}
```

**Check it**: ten characters, from the network. Open the browser's Network tab and
watch the request go out.

> `inject()` and a constructor parameter do the same thing. `inject()` is the
> current form, and the only one that works in a field initialiser like the one
> above.

### 4. Search on the server

The filter no longer filters an array — it triggers a request. Push what the user
types into a `Subject`, and let RxJS do the rest:

```ts
searchTerm$ = new BehaviorSubject<string>('');

people$ = this.searchTerm$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((term) =>
    this.http.get<PeopleResponse>(`https://swapi.dev/api/people/?search=${term}`),
  ),
  map((response) => response.results),
);
```

Wire the filter's output to `searchTerm$.next($event)`.

Each operator earns its place, and you should see each one do its job in the
Network tab:

- **`debounceTime(300)`** — one request per pause in typing, not one per keystroke.
  Remove it and count the requests for `skywalker`.
- **`distinctUntilChanged()`** — typing `r2`, deleting the `2`, retyping it must not
  fire a second identical search.
- **`switchMap`** — **cancels** the in-flight request when a new term arrives. With
  `mergeMap` instead, a slow response to `r` can land *after* the response to `r2`
  and overwrite it. That race is the bug this operator exists for; it shows up in
  the Network tab as a request marked *canceled*.

Also: encode the term (`encodeURIComponent`), or a search for `a b` builds a
broken URL.

### 5. Handle the failure

A network call fails. Kill your Wi-Fi, or point the URL at a typo, and look at
what the page does today: nothing, silently.

```ts
readonly error = signal<string | null>(null);

// …inside the switchMap, on the request itself:
this.http.get<PeopleResponse>(url).pipe(
  catchError((failure: HttpErrorResponse) => {
    this.error.set('La recherche a échoué');
    return of({ count: 0, next: null, previous: null, results: [] } as PeopleResponse);
  }),
)
```

Put `catchError` **inside** the `switchMap`, on the inner request — not at the end
of the outer pipe. On the outer pipe, one failure completes the stream and the
search field is dead for the rest of the session. Try both and watch it happen.

Show the message in the template, and add a `loading` flag driven by `tap`.

### 6. *(Bonus)* Pagination

The API returns ten characters per page and hands you the URLs for the rest.

1. Keep the current page in a second `BehaviorSubject<number>`.
2. Combine the two streams — `combineLatest([searchTerm$, page$])` — and build the
   URL from both. A new search must reset the page to 1.
3. Add *Précédent* / *Suivant* buttons, disabled when `previous` / `next` is `null`.
4. Show `Page X — N personnages` from `count`.

### 7. *(Bonus)* An interceptor

Move the `https://swapi.dev/api` prefix out of the components: register a
functional interceptor that rewrites relative URLs, so the calls read
`this.http.get('/people/?search=…')`.

```ts
provideHttpClient(withInterceptors([baseUrlInterceptor]));
```

## Definition of Done

**It builds and runs**

- [ ] `npm run build` exits 0
- [ ] No error in the browser console, and no unhandled promise rejection

**The behaviour is there**

- [ ] The table is filled from the network — there is no character array left in the
      source
- [ ] Typing `skywalker` fires **one** request, not nine (checked in the Network tab)
- [ ] Deleting a character and retyping the same one fires no new request
- [ ] Typing fast leaves exactly one non-cancelled request, and the rows match the
      **last** term typed
- [ ] A failing request shows a message on the page, and the search field still works
      afterwards
- [ ] Nothing in the code calls `.subscribe()` in the component — the template does it
      through `async`

**You can explain**

- [ ] What `switchMap` cancels, and the bug you get with `mergeMap` instead
- [ ] Why `catchError` goes inside the `switchMap` and not at the end of the pipe
- [ ] What the `async` pipe does on component destruction, and what you would have to
      write by hand without it

## Going further

- Replace the `async` pipe with `toSignal(people$)` and read `people()` in the
  template. Where does the initial value come from, and what happens before the
  first response?
- Rewrite the whole thing with `httpResource()` — the signal-based API. Count the
  lines, then ask yourself what you lost from step 4.
- Add `retry({ count: 2, delay: 1000 })` before `catchError` and simulate a flaky
  network with the browser's throttling.
- Cache the responses per term with `shareReplay(1)` on a per-term stream, and find
  the leak that a naive `shareReplay` introduces.
