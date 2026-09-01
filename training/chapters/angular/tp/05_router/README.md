# TP 5 — The router

> Deck section **Router**. ~1h. Continues the project of workshop 4.

## Goal

Turn one page into an application with two. By the end you can:

- declare routes, including one with a parameter, and render them in an outlet
- navigate with `routerLink`, and read a parameter without subscribing to anything
- highlight the current page, with `routerLinkActive` and with the `isActive` signal
- lazy-load a route, and see the chunk it saves in the build output

The feature you are adding: clicking a character's name opens **its own page**.

## Prerequisites

- Workshop 4 finished: the table is filled from SWAPI, and the search works

## Setup

```shell
cd first-project
npm start
```

> **No install needed.** `@angular/router` ships with the framework and is already
> in your `package.json` — older instructions tell you to `npm install` it, which
> at best is a no-op and at worst pulls a version that does not match your Angular.
> Check for yourself: `npm ls @angular/router`.

## Steps

### 1. Make room — `Home`

Generate a `Home` component and **move** into it everything the root component
currently holds: the filter, the table, the search stream, the HTTP call.

```shell
ng generate component home
```

`App` keeps only the page shell — and, in a moment, the outlet.

### 2. A second page — `PersonPage`

```shell
ng generate component person-page
```

Any markup will do for now: `<h1>Person</h1>`.

> **Why not `Person`?** Because that name is already taken — by the `Person`
> *interface* of workshop 2, which the detail page has to import to type its own
> data. Two things called `Person` in one file is a compile error, and renaming the
> model afterwards is worse. The route stays `/person/:id`: the URL and the class
> name are unrelated.

### 3. The routes — `src/app/app.routes.ts`

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'person/:id', component: PersonPage },
  { path: '**', redirectTo: '' },
];
```

Register them in `src/app/app.config.ts`:

```ts
import { provideRouter, withComponentInputBinding } from '@angular/router';

providers: [
  provideHttpClient(),
  provideRouter(routes, withComponentInputBinding()),
],
```

And give `App` somewhere to render them — `src/app/app.html`:

```html
<router-outlet />
```

**Check it**: `/` shows the table, `/person/1` shows the `PersonPage` component. Type
both in the address bar.

> `{ path: '', component: Home }` matches the empty path only because the default
> `pathMatch` for a route with children is `prefix`. Get it wrong on a redirect —
> `{ path: '', redirectTo: 'home' }` without `pathMatch: 'full'` — and you get an
> infinite redirect loop. It is a rite of passage; cause it once, deliberately.

### 4. The link — `PeopleItem`

The API gives you no id, but the `url` field ends with one:

```ts
// https://swapi.dev/api/people/1/  ->  '1'
function getIdFromUrl(url: string): string {
  return url.replace('https://swapi.dev/api/people/', '').replace('/', '');
}
```

Make the character's name a link to its page:

```html
<td>
  <a [routerLink]="['/person', id()]">{{ person().name }}</a>
</td>
```

`routerLink` needs importing into the component that uses it — `imports: [RouterLink]`
in `PeopleItem`. Forgetting it is the most common router error, and its message
(`Can't bind to 'routerLink' since it isn't a known property of 'a'`) tells you
exactly that once you have seen it once.

> Use `routerLink`, not `href`. `href` reloads the whole application; `routerLink`
> navigates in place — and still gives you a real link the browser can open in a
> new tab.

### 5. Read the parameter — `PersonPage`

Because of `withComponentInputBinding()`, the route parameter arrives as an
**input** with the same name:

```ts
export class PersonPage {
  id = input.required<string>();
}
```

Fetch the character it names, and render it:

```
https://swapi.dev/api/people/1/
```

Do it reactively, so that navigating from `/person/1` to `/person/2` **refetches**:

```ts
private http = inject(HttpClient);

person$ = toObservable(this.id).pipe(
  switchMap((id) => this.http.get<Person>(`https://swapi.dev/api/people/${id}/`)),
);
```

Show the name, height, mass, gender and birth year, in a Bulma card or table, and
add a link back to `/`.

**Check it**: `/person/4` shows Darth Vader. Then navigate from the table to two
different characters in a row **without** reloading — the second one must show the
second character. A component that renders the first one twice is a component
that read the parameter once, in a constructor.

> Without `withComponentInputBinding()`, the same job is
> `inject(ActivatedRoute).paramMap` — an observable, for exactly this reason.
> `route.snapshot.paramMap.get('id')` reads it **once**, which is the bug above.

### 6. Handle the 404

`/person/9999` returns a 404. Catch it and render "Personnage introuvable" with a
link home, rather than leaving the page blank.

### 7. Show which page you are on

Give `App` a navigation bar, above the outlet — `src/app/app.html`:

```html
<nav class="navbar">
  <a class="navbar-item" routerLink="/" routerLinkActive="is-active"
     [routerLinkActiveOptions]="{ exact: true }">Personnages</a>
  <a class="navbar-item" routerLink="/person/1" routerLinkActive="is-active">Luke</a>
</nav>

<router-outlet />
```

`App` now uses three directives — `imports: [RouterOutlet, RouterLink, RouterLinkActive]`.

`routerLinkActive` adds the class while its link's route is active — and
`{ exact: true }` is what stops `/` from being "active" on every page, since every
URL starts with it.

**Check it**: the highlight moves as you navigate, and survives a hard refresh.

Now the same question, but in TypeScript. `routerLinkActive` only styles a link;
when the *component* needs to know where it is, use the `isActive` **function** of
`@angular/router` — added in Angular 21.1, it returns a `Signal<boolean>` that the
router recomputes on every navigation:

```ts
import { Component, inject } from '@angular/core';
import { isActive, Router } from '@angular/router';

export class App {
  private router = inject(Router);

  onDetail = isActive('/person', this.router);
}
```

```html
<nav class="navbar">
  <!-- … the two links … -->
  @if (onDetail()) {
    <span class="tag is-info">Fiche personnage</span>
  }
</nav>
```

**Check it**: the badge appears on `/person/3` and disappears on `/`. You wrote no
subscription, no `NavigationEnd`, no `ngOnInit` — and the value is a signal, so you
can build on it: `showBackLink = computed(() => this.onDetail() && !this.isLoading())`.

> **Why not `router.isActive('/person', ...)`?** Because the *method* answers once,
> at the moment you call it: put it in a field and it is frozen; put it in a getter
> and it only re-runs when something else happens to trigger change detection. The
> method is deprecated for exactly this reason. The function returns a signal, so
> `@if` re-evaluates when — and only when — the URL changes.

> The third argument decides how strictly the URLs are compared:
> `isActive('/person', this.router, { paths: 'exact', queryParams: 'ignored',
> fragment: 'ignored', matrixParams: 'ignored' })`. With the default `paths:
> 'subset'`, `/person` counts as active while you are on `/person/3` — which is what
> we want here. Switch it to `'exact'` and watch the badge never appear.

### 8. *(Bonus)* Lazy-load the detail page

```ts
{
  path: 'person/:id',
  loadComponent: () => import('./person-page/person-page').then((m) => m.PersonPage),
}
```

Run `npm run build` before and after, and compare: the person page is now its own
chunk, not part of the initial bundle. Watch it load in the Network tab on the
first navigation.

### 9. *(Bonus)* A resolver, and a guard

- A `resolve` on the route fetches the character **before** the component is
  created — the page never renders empty. What did you lose in exchange?
- A `canMatch` guard that refuses a non-numeric id, sending `/person/abc` to the
  404 page without ever firing a request.

## Definition of Done

**It builds and runs**

- [ ] `npm run build` exits 0
- [ ] No error in the browser console during a full navigation tour

**The behaviour is there**

- [ ] `/` shows the searchable table; `/person/1` shows Luke Skywalker
- [ ] Clicking a name in the table navigates **without a full page reload** (the
      Network tab shows an API call, not a document request)
- [ ] Ctrl/Cmd-clicking a name opens the character in a new tab
- [ ] Going from one character to another, without passing through the table, shows
      the **second** character
- [ ] A hard refresh on `/person/3` lands on that character
- [ ] `/person/9999` shows a "not found" message, not a blank page
- [ ] An unknown URL — `/nope` — lands on the table
- [ ] The navigation bar highlights the page you are on, and `Personnages` is *not*
      highlighted while you are on a character
- [ ] The `Fiche personnage` badge shows on `/person/:id` only, and it is driven by
      `isActive`, not by a subscription

**You can explain**

- [ ] Why `routerLink` and not `href`
- [ ] Why `route.snapshot` breaks when navigating between two ids, and what fixes it
- [ ] What `withComponentInputBinding()` does, and what you would write without it
- [ ] Why `isActive(...)` returns a signal, and what the deprecated `Router.isActive()`
      method could not do

## Going further

- Nest the character's *films* under `/person/:id/films` with a child route and a
  second `<router-outlet>`.
- Add a `title` to each route and check the browser tab: Angular's `TitleStrategy`
  reads it for you.
- Set `scrollPositionRestoration: 'enabled'` via `withInMemoryScrolling()` and see
  what going back to a scrolled table does with and without it.
- Preload the lazy route with `withPreloading(PreloadAllModules)`, and decide
  whether it was worth lazy-loading at all.
