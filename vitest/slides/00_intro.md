---
layout: cover
---

# Program

---

<table>
<tbody>
 <tr style="border: 0; font-size: 0.8em">
    <td>
        <strong>Morning</strong>
        <ul>
            <li>0 - Introduction to the training</li>
            <li>1 - Getting started
                <ul>
                    <li>Why test, the test pyramid, the ecosystem</li>
                    <li>Install, <code>vitest.config.ts</code>, the CLI, the UI</li>
                </ul>
            </li>
            <li>2 - Writing tests
                <ul>
                    <li><code>describe</code> / <code>it</code>, modifiers, <code>test.each</code>, hooks</li>
                    <li>Assertions, coverage, in-source testing</li>
                </ul>
            </li>
            <li>3 - Custom matchers
                <ul>
                    <li><code>expect.extend</code>, asymmetric matchers, typings</li>
                </ul>
            </li>
            <li>4 - Snapshots</li>
        </ul>
    </td>
    <td>
        <strong>Afternoon</strong>
        <ul>
            <li>5 - Mocks
                <ul>
                    <li><code>vi.fn</code>, <code>vi.spyOn</code>, <code>vi.mock</code>, fake timers</li>
                </ul>
            </li>
            <li>6 - Vue Testing Library
                <ul>
                    <li>Queries by role, <code>user-event</code>, emitted events</li>
                </ul>
            </li>
            <li>7 - Advanced
                <ul>
                    <li>Fixtures, projects, browser mode, benchmarks, type testing</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training objectives

- **Set up** Vitest in a Vite or Node project, and run it in watch mode, in CI
  and in its UI
- **Write** readable tests: suites, parameterised cases, hooks, the right
  assertion for each check
- **Measure** what the tests cover — and know what coverage does not say
- **Extend** `expect` with matchers that speak your domain
- **Capture** output with snapshots, without letting them rot
- **Isolate** a unit with mocks, spies and fake timers — and know when not to
- **Test Vue components** the way a user uses them, with Testing Library
- **Organise** a test suite: fixtures, projects, browser mode, type tests

<br />

> This training is based on **Vitest 5**, **Vue 3.5**, **Node.js 24** and **TypeScript 7**.

---

# Prerequisites

- **Modern JavaScript** (ES2015+): `const` / `let`, arrow functions,
  destructuring, spread, modules, `async` / `await`
- Basic **TypeScript** reading — the workshops are in TypeScript, but no
  advanced type is needed
- Basic **Vue 3** (`<script setup>`, props, emits) for chapter 6
- A **laptop** with Node.js >= 22.22.2 installed (24.15+ recommended), and an
  editor (VS Code, WebStorm…)

---

# Before we start

- **Schedule** of the day: start, breaks, lunch, end
- **Introduction round**: your role, your stack, what you test today — and how
- **npm**, **pnpm** or **yarn**? The workshops use `npm`; every command has its
  equivalent
- **TypeScript** or **JavaScript** at work? Everything shown works in both — the
  types are a bonus, not a requirement
- What would make this day **worth it** for you?

---

# How the day runs

| Morning | | Afternoon | |
|---|---|---|---|
| 1 — Getting started | TP 1 | 5 — Mocks | TP 5 |
| 2 — Writing tests | TP 2 | 6 — Vue Testing Library | TP 6 |
| 3 — Custom matchers | TP 3 | 7 — Advanced | TP 7 |
| 4 — Snapshots | TP 4 | Retro | |

<br />

- **Seven hands-on sessions**, each on its own standalone project — about half the time
- Each chapter closes with a **quiz** corrected together, the day with a **retro**

---

# Teaching methods

- Alternation between **theoretical lectures** and **hands-on practice**
- One domain across the workshops: a small **bookshop** — books, a cart,
  coupons, a receipt, a checkout calling an API
- Field experience feedback from the trainer
- Digital course materials provided

<br />

# Evaluation

- A **self-assessment questionnaire** before the session
- A short **formative quiz** closing each chapter, corrected together
- Continuous evaluation through the **workshops** and their Definition of Done
- A **final questionnaire** mirroring the self-assessment, to measure progress

---

# The workshop projects

- **Seven standalone workshops**, one per chapter, under `workshops/`:

```bash
cd 01_getting_started
npm install
npm run test:watch   # Vitest in watch mode — keep it open
npm run typecheck    # tsc --noEmit (vue-tsc in workshop 6)
```

- Each `README.md` lists the steps, and ends with a **Definition of Done**
- In some workshops **you** write the tests: the starter ships `it.todo`s and
  is green — the README says how you know your tests are worth anything
- No workshop imports another: start any of them on its own
- The worked answers live in `solutions/`, one runnable folder per workshop
- `node check-env.mjs --install` (at the root of `workshops/`) checks your
  machine and pre-installs every workshop — ideally **run a week before** the session
