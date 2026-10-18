# TP 21 — End-to-end tests with Cypress

> This TP is **autonomous**: it does not depend on any other TP. The app (a
> people list, a person page, a create form, all on React Router) and its fake
> API are provided and working; your job is to write the Cypress suite that
> drives it in a real browser — and to fix the bug it finds.

## Goal

Chapter 21 — Test the application the way a user uses it:

- **Cypress 16** set up against the dev server: `cypress.config.ts`, `baseUrl`, `npm run e2e`
- **Accessible queries** with the built-in `cy.getByRole(role, { name })`
- **Network control** with `cy.intercept`: spy and `cy.wait('@alias')`, stub with a fixture or an error
- **Custom commands** that set the backend up through the API (`cy.request`), not the UI
- Retry-ability: assertions that wait, and **never** a `cy.wait(1000)`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- The Cypress binary: `npm install` downloads it into `~/.cache/Cypress` (about
  200 MB, once per version). If your network blocks it, `npx cypress install`
  retries; `npx cypress verify` checks it runs. On Linux, Cypress needs a few
  system libraries (`libgtk-3`, `libnss3`, `libxss1`, `xvfb`…), see
  <https://on.cypress.io/install>
- Chapter 14 (React Router) and chapter 3 (Testing Library): `getByRole` works the same way here

## Setup

```bash
npm install
npm run dev          # the app and its API, http://localhost:5173
npm run typecheck    # tsc, on the app AND on cypress/ (its own tsconfig)
npm test             # vitest run — a few unit specs, green from the start
npm run e2e          # starts the dev server, runs Cypress headless, stops the server
npm run e2e:open     # the same, with the Cypress UI
```

`npm run e2e` uses `start-server-and-test`: it runs `npm run dev`, waits for
`http://localhost:5173` to answer, runs `cypress run`, then stops the server. If
the dev server is already running, use `npm run cy:run` / `npm run cy:open`
directly.

What grades this TP is **your** Cypress suite: the three files of
`cypress/e2e/` ship with the tests named and empty (each one throws a `TODO`).
`npm run e2e` must end on **All specs passed!** with 12 tests. The CI of the
training does not start a browser, so it does not run them: this one is on you.

**Already done for you:**

- The app: `src/pages/` (`PeoplePage` with a `?q=` filter, `PersonPage`,
  `CreatePersonPage` with a React Router `action`, `ErrorPage`) and
  `src/router.tsx`.
- `server/` — the fake API, served by the Vite dev server itself (see
  `vite.config.ts`): `GET /api/people`, `GET /api/people/:id`, `POST /api/people`,
  and `POST /api/reset` to put the seed data back. It answers after 300 ms, so
  the loading states can be seen. Because it is a **real** HTTP endpoint,
  `cy.intercept` sees every request. A Service Worker mock (MSW) would answer
  inside the browser, before Cypress could see anything.
- `cypress/tsconfig.json` — Cypress' globals (`cy`, its chai `expect`) clash
  with Vitest's, so `cypress/` is type-checked apart.
- `cypress/support/commands.ts` — the **types** of two custom commands,
  `cy.resetApi()` and `cy.seedPerson()`.
- `cypress/fixtures/two-people.json`.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Point Cypress at the dev server | `cypress.config.ts` | `npm run e2e:open` lists the three specs |
| 2 | The two custom commands | `cypress/support/commands.ts` | `cy.resetApi()` runs before each test |
| 3 | The list and its filter — and the bug it finds | `cypress/e2e/people.cy.ts` + `src/pages/PeoplePage.tsx` | The first three tests are green |
| 4 | The person page and the create form | `cypress/e2e/person.cy.ts` + `create.cy.ts` | Their tests are green, except the bonus |
| 5 | Stub the network: a fixture, a 500, a held response | the three spec files | `npm run e2e`: **All specs passed!**, 12 tests |

## Steps

### 1. Configure Cypress — `cypress.config.ts`

1. **TODO 1.1** — add `baseUrl: 'http://localhost:5173'` to `e2e`. The dev
   server uses `strictPort` (see `vite.config.ts`): if 5173 is taken, it fails
   instead of moving to 5174 behind Cypress' back.
2. Run `npm run e2e:open`, choose **E2E Testing** and a browser: the three spec
   files are listed. Open one — red, on `TODO 2.1`.

→ **Done when** the Cypress UI lists `create.cy.ts`, `people.cy.ts` and `person.cy.ts`.

### 2. Custom commands — `cypress/support/commands.ts`

Each test starts from the same backend, set up through the **API**: it is fast,
and a test never depends on what the previous one left behind.

1. **TODO 2.1** — `resetApi`: `cy.request('POST', '/api/reset')`. A relative URL
   is resolved against `baseUrl`.
2. **TODO 2.2** — `seedPerson`: `cy.request<Person>('POST', '/api/people', person).its('body')`
   — **return** that chain, so the command yields the created person.

→ **Done when** each test now fails on its own `TODO`, past the `beforeEach`.

### 3. The list — `cypress/e2e/people.cy.ts`

1. **TODO 3.1** — in `beforeEach`, `cy.intercept('GET', '/api/people').as('getPeople')`.
   No response given: it is a **spy**, the real API still answers.
2. **TODO 3.2** — `cy.visit('/')`, then `cy.wait('@getPeople').its('response.statusCode').should('eq', 200)`.
   Expect six rows in `tbody`, and `cy.getByRole('row', { name: /Darth Vader/ })`
   to contain `41.9BBY`. `cy.getByRole` is built into Cypress 16: same idea as
   Testing Library, no plugin.
3. **TODO 3.3** — `cy.getByRole('searchbox', { name: 'Filter by name' }).type('sky')`:
   one row left, Luke's, and `cy.location('search').should('eq', '?q=sky')`.
   Then `cy.reload()`, wait for `@getPeople` again: the filter survived.
4. **TODO 3.4** — the test is red, **and it is right**: the URL ends up with
   `?q=y` or `?q=ky`. Open `src/pages/PeoplePage.tsx`: the input's value is read
   back from `searchParams`, and each `setSearchParams` is a navigation, which
   finishes after the next keystroke has already arrived. `cy.type` types fast,
   like a user in a hurry. Fix it: the input owns its value in a `useState`
   (initialised from `?q=`), and the URL just mirrors it. This is the kind of
   bug a unit test with `fireEvent.change` never sees.
5. **TODO 3.5** — `cy.visit('/?q=yoda')`: no table, and
   `cy.getByRole('status', { native: false })` reads `No people match “yoda”.`
   `native: false` is needed because no HTML element is a `status` by itself:
   the role comes from the `role` attribute.

→ **Done when** the first three tests of `people.cy.ts` are green.

### 4. The person page and the form — `person.cy.ts` + `create.cy.ts`

1. **TODO 4.1** — from `/?q=vader`, click the `link` "Darth Vader": the path is
   `/people/4`, the `heading` "Darth Vader" shows, and `cy.contains('dd', '202 cm')`.
   `cy.go('back')` brings back the filtered list.
2. **TODO 4.2** — create the person through the API, then visit their page:

   ```ts
   cy.seedPerson({ name: 'Ahsoka Tano', height: '170' }).then((ahsoka) => {
     cy.visit(`/people/${ahsoka.id}`);
   });
   ```

   The heading "Ahsoka Tano" and "170 cm" show.
3. **TODO 4.3** — `/people/999` shows the heading "Not found" and "Person not found".
4. **TODO 4.4** — `cy.intercept('POST', '/api/people').as('createPerson')`, then `cy.visit('/create')`.
5. **TODO 4.5** — submit the empty form: the `alert` reads "Name is required",
   the Name `textbox` has `aria-invalid="true"`, and
   `cy.get('@createPerson.all').should('have.length', 0)` proves nothing was sent.
6. **TODO 4.6** — type the name and the height, `select('Female')` in the
   Gender `combobox`, submit, and in `cy.wait('@createPerson').then(({ request, response }) => …)`
   assert the exact `request.body` and the 201. You land on `/people/<id>`;
   back on "People", the table has 7 rows, the last one Ahsoka's.

→ **Done when** `create.cy.ts` is green except 5.4, and `person.cy.ts` except 5.3.

### 5. Control the network — the three spec files

1. **TODO 5.1** — `cy.intercept('GET', '/api/people', { fixture: 'two-people.json' })`:
   the app renders two rows, Grogu included. A **later** intercept on the same
   route wins over the one in `beforeEach`.
2. **TODO 5.2** — `{ statusCode: 500, body: { message: 'The Death Star is down' } }`:
   the `alert` shows "Something went wrong" and the message, and the `navigation`
   "Main" is still on screen — the error page renders inside the layout.
3. **TODO 5.4** — a 500 on the `POST`: the alert says "could not be created", you
   are still on `/create`, and the name you typed is still in the field.
4. **TODO 5.3** *(Bonus)* — the loading state, without a race: give `cy.intercept`
   a handler returning a promise you resolve yourself, only once
   `cy.getByRole('status', { native: false })` shows "Loading…":
   `cy.intercept('GET', '/api/people/1', (req) => held.then(() => req.continue()))`.

→ **Done when** `npm run e2e` ends on **All specs passed!** with 12 tests.

## Definition of Done

Tick every box before moving on. Step 5.3 and the "Going further" section are
**not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0 — including `cypress/`
- [ ] `npm test` exits 0 and `npm run build` succeeds
- [ ] `npm run e2e` ends on **All specs passed!**, and does so three times in a row
- [ ] `grep -rn TODO src cypress cypress.config.ts | grep -v bonus` returns nothing
- [ ] `grep -rn "cy.wait([0-9]" cypress` returns nothing

**The behaviour is there**

- [ ] Every test starts from a reset backend, set up through the API
- [ ] Every network call a test depends on is aliased and waited for
- [ ] The filter keeps every keystroke, and survives a reload
- [ ] The fixture, the 500 on the list and the 500 on the form are each covered

**You can explain**

- [ ] The difference between a spy (`cy.intercept(route)`) and a stub (`cy.intercept(route, response)`)
- [ ] Why `cy.wait('@alias')` is reliable and `cy.wait(1000)` is not
- [ ] Why Cypress cannot see requests answered by a Service Worker mock
- [ ] What the filter bug was, and why a jsdom unit test would not have found it

## Going further

- Write the same `people.cy.ts` with **Playwright** (`npm init playwright@latest`):
  `page.getByRole`, `page.route` for stubbing, `webServer` in
  `playwright.config.ts` instead of `start-server-and-test`. Compare the two.
- Run Cypress in GitHub Actions with `cypress-io/github-action`, which starts
  the server and caches the binary.
- Run the suite against the production build: `npm run build && npm run preview`
  (port 4173, the fake API is served there too) — change `baseUrl` for that run
  with `--config baseUrl=http://localhost:4173`.
- Try `cy.press(Cypress.Keyboard.Keys.TAB)` to check the keyboard order of the form.
- Write a component test with `cypress open --component` for `ErrorPage`, and
  compare it with the same test in Vitest.
