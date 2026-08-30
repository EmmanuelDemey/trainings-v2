# TP 1 — Getting started

> The toolchain, before the deck starts. ~45 min. This is the **first** workshop:
> it creates the project that the five that follow all build on.

## Goal

Get a running Angular application, styled, on your machine — and understand what
the CLI generated. By the end you can:

- create a project with `@angular/cli` and read its file tree
- run the dev server and see a change without reloading by hand
- add a CSS library to a project the right way (not with a `<link>` in `index.html`)
- produce a **production** build and serve it, which is not the same thing as `ng serve`

## What you are building — across the six workshops

An application that browses the **Star Wars** characters: a table, a search
field, a detail page, and a "likes" counter shared between pages. Each workshop
continues the same project, so keep it — there is no separate starter per
workshop.

| | Workshop | What it adds |
|---|---|---|
| 1 | Getting started | the project, Bulma, the dev loop |
| 2 | Template | the table, from an in-memory array |
| 3 | Components | the search field, split into three components |
| 4 | RxJS & HTTP | the real API, server-side search, pagination |
| 5 | Router | a second page, `/person/:id` |
| 6 | Services | likes, shared between the two pages |

## Prerequisites

- **Node.js** — a version supported by the current Angular CLI (`node -v`; 22.x or
  24.x are safe). Angular's own error message tells you if yours is too old.
- A terminal, and an editor with the **Angular Language Service** extension
  (VS Code: `Angular.ng-template`). It is what turns a typo in a template into a
  red squiggle instead of a blank page.

## Setup

Install the CLI globally, then create the project:

```shell
npm install -g @angular/cli
ng new first-project
```

The generator asks a few questions. Answer:

- **stylesheet system** — CSS
- **SSR / SSG** — **No**. Everything in this training runs in the browser.
- recent CLIs also offer to write configuration files for a few AI assistants —
  any answer is fine, it changes nothing below.

> **On `--standalone`** — older instructions pass this flag. It still exists, and
> its default is now `true`: passing it changes nothing. Standalone components have
> been the default since Angular 17 — there is no `NgModule` anywhere in the
> project you just generated, and that is the point.

```shell
cd first-project
npm start          # http://localhost:4200
```

## Steps

### 1. Read what was generated

Before changing anything, open these five and be able to say what each one is for:

| File | What it is |
|---|---|
| `src/main.ts` | the entry point — `bootstrapApplication(App, appConfig)` |
| `src/app/app.config.ts` | the application's **providers**, where chapters 4 and 5 will add HTTP and the router |
| `src/app/app.ts` | the root component — a class with a `@Component` decorator |
| `src/app/app.html` | its template |
| `angular.json` | the CLI's own configuration: builder, entry points, budgets |

> **On file names** — Angular 20 made the concise naming the default: `app.ts` and a
> class named `App`, where older projects have `app.component.ts` and `AppComponent`.
> If yours look like the latter you are on an older CLI (or someone passed
> `--file-name-style-guide=2016`): everything below still applies, only the file
> names differ. The instructions use the current names.

### 2. See the dev loop work

With `npm start` running, change the title in `src/app/app.html` and save. The
browser updates **without a full reload** — that is the dev server's hot module
replacement, and it is the reason you leave it running all day.

Now make a deliberate mistake: write `{{ notAProperty }}` in the template. Read
what the terminal and the browser say, then undo it. Knowing what this failure
looks like is worth more than never causing it.

### 3. Add Bulma

[Bulma](https://bulma.io/) is a class-based CSS framework — no JavaScript, no
components to import. It is what makes the tables and forms of the next workshops
look like an application instead of a plain document.

```shell
npm install bulma
```

Import it **once**, at the top of `src/styles.css`:

```css
@import "bulma/css/bulma.css";
```

> You will find instructions that put this import in `src/main.ts` instead. That
> works too, but the global stylesheet is where the CLI already expects it — and
> `angular.json` is what decides that `styles.css` is global in the first place.
> Have a look at its `styles` array.

### 4. A Bulma layout

Replace the whole of `src/app/app.html` with:

```html
<section class="section">
  <div class="container">
    <h1 class="title">Hello World</h1>
    <p class="subtitle">
      My first website with <strong>Bulma</strong>!
    </p>
  </div>
</section>
```

The generated template contains a large welcome page; deleting it is the intent.
Check the browser: the title must now be styled by Bulma — large, spaced, in
Bulma's font. If it looks like plain unstyled HTML, the import of step 3 did not
land.

While you are there, give the page a real title in `src/index.html`:

```html
<title>Star Wars</title>
```

### 5. A production build

```shell
npm run build
```

Read the output: the CLI prints the size of each bundle, and warns you when one
crosses the **budgets** declared in `angular.json`. Then serve the result the way
a web server would:

```shell
npx serve dist/first-project/browser
```

Open it. It is the same application, minified, with no dev server in front of it.

> **`dist/first-project/browser`, not `dist/first-project`** — the application
> builder puts the browser bundle in a `browser/` sub-folder, next to the
> `server/` one it would produce for SSR. Older instructions point at the parent
> folder; on a current CLI that folder has no `index.html` in it.

### 6. *(Bonus)* Look at what the CLI can generate

```shell
ng generate component people-table --dry-run
```

`--dry-run` prints what it *would* write without writing it. Workshop 3 uses this
command for real — knowing it now saves you creating four files by hand.

## Definition of Done

**It runs**

- [ ] `npm start` serves the application on <http://localhost:4200> with no error in
      the terminal and none in the browser console
- [ ] `npm run build` exits 0
- [ ] `npx serve dist/first-project/browser` serves the built application

**It is styled**

- [ ] The `Hello World` heading is styled by Bulma — not by the browser's defaults
- [ ] Bulma is imported **once**, in `src/styles.css`, and there is no `<link>` to a
      CSS CDN in `index.html`
- [ ] The browser tab says `Star Wars`

**You can explain**

- [ ] What `bootstrapApplication` in `main.ts` does, and what `app.config.ts` is for
- [ ] Why there is no `NgModule` anywhere in the project
- [ ] The difference between `npm start` and `npm run build` — and which one you would
      ever deploy

## Going further

- Run `ng build --configuration development` and compare the bundle sizes with the
  production ones. Where does the difference come from?
- Lower a budget in `angular.json` until the build **fails**, and read the error.
  A budget you have never seen fire is a budget you do not trust.
- `ng update` — run it with no arguments. It tells you what is upgradable without
  touching anything.
