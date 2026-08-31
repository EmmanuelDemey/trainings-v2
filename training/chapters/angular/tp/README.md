# Angular — Workshops (TP)

Hands-on exercises for the **Angular** training. Across the six workshops you
build **one** application: a browser for the Star Wars characters, from
`ng new` to a shared state service.

```
1. Getting started   the project, Bulma, the dev loop
2. Template          the table, from an in-memory array
3. Components        the search field, split into three components
4. RxJS & HTTP       the real API, server-side search, pagination
5. Router            a second page, /person/:id
6. Services          likes, shared between the two pages
```

## One project, six workshops

Unlike the other trainings on this site, these workshops are **not** standalone:
workshop 2 continues workshop 1's project, and so on. There is no starter folder
per exercise, because the first exercise *is* creating the project — with the
CLI, which is how every Angular project starts.

Practical consequence: **keep `first-project/` between the sessions**, and commit
it. If you fall behind, the fastest way back in is to ask for the state of the
project at the end of the previous workshop rather than to rebuild it in a hurry.

## What the workshops do not cover

The deck has two sections with no workshop of their own: **Forms** (template-driven
and reactive forms, custom validators) and **Tests**. The search field of workshop 3
is the only form in the six exercises, and it is deliberately hand-wired rather than
built with `FormControl` — so that the difference is visible when the deck gets
there. If your session has the time, the natural place to add reactive forms is
workshop 4: replacing the manual `(input)` handler with a `FormControl` and its
`valueChanges` stream removes half of that workshop's plumbing.

## Before day 1 — check your machine

```shell
node -v          # a version the current Angular CLI supports (22.x or 24.x are safe)
npm -v
npm install -g @angular/cli
ng version
```

`ng version` prints the Angular, CLI and Node versions it sees, and complains if
they do not go together. Run it **before** the training, not on the room Wi-Fi on
day 1: `ng new` downloads a few hundred megabytes, and a corporate proxy that
blocks the npm registry is the one problem that cannot be fixed during the
session.

The workshops call a public API over HTTPS — check that it answers from your
network too:

```shell
curl "https://swapi.dev/api/people/?search=r2"
```

Install the **Angular Language Service** extension in your editor (VS Code:
`Angular.ng-template`). Every workshop assumes a template typo is underlined
rather than discovered in the browser.

## The API

[SWAPI](https://swapi.dev/) — no key, no signup, CORS open, 82 characters
paginated ten at a time. Workshops 1 to 3 work from an in-memory copy of four of
them; workshop 4 switches to the real thing.

If `swapi.dev` is unreachable from your network, `https://swapi.info/api/people`
returns the whole array unpaginated and `https://swapi.tech` is a second mirror —
both with slightly different shapes, which workshop 4 tells you how to spot.

## How a workshop reads

A goal, the prerequisites, a setup block, then **numbered steps**, and a
**Definition of Done** you can check yourself: a command that exits 0, something
observable in the browser, a question you can answer. Steps marked *(Bonus)* and
the "Going further" section are deliberately **outside** the Definition of Done —
it is the floor, not the ceiling.

## Angular versions

Written against the **current** Angular (22 at the time of writing) and its
defaults: standalone components, the built-in control flow (`@if` / `@for`),
`inject()`, signal inputs and outputs, `provideHttpClient()` and `provideRouter()`.

Two places where you will find older instructions on the internet, and what they
mean for you:

| You will read | On a current CLI |
|---|---|
| `ng new … --standalone` | a no-op — the flag now defaults to `true`; standalone since v17 |
| `app.component.ts`, `AppComponent` | `app.ts`, `App` — the concise naming is the default since v20 |
| `npm install @angular/router` | already installed: it ships with the framework |
| `dist/<project>/` holds `index.html` | it is in `dist/<project>/browser/` |
| `*ngFor`, `*ngIf` | still work; `@for` / `@if` are what the deck teaches |

Where the two forms differ, each workshop shows the current one and names the old
one — recognising legacy code is part of the job.
