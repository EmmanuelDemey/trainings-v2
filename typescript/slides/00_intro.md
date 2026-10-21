---
layout: cover
---

# Program

---

<table>
<tbody>
 <tr style="border: 0; font-size: 0.85em">
    <td>
        <strong>Day 1</strong>
        <ul>
            <li>0 - Introduction to the training</li>
            <li>1 - From JavaScript to TypeScript
                <ul>
                    <li>The compiler, <code>tsconfig.json</code>, <code>strict</code></li>
                    <li>Running TypeScript: type stripping vs type checking</li>
                </ul>
            </li>
            <li>2 - Everyday types
                <ul>
                    <li>Primitives, arrays, tuples, objects, functions</li>
                    <li><code>any</code>, <code>unknown</code>, <code>never</code>, <code>as const</code>, <code>satisfies</code></li>
                </ul>
            </li>
            <li>3 - Classes &amp; interfaces</li>
            <li>4 - Unions &amp; narrowing
                <ul>
                    <li>Discriminated unions, type guards, exhaustiveness</li>
                </ul>
            </li>
            <li>5 - Generics</li>
        </ul>
    </td>
    <td>
        <strong>Day 2</strong>
        <ul>
            <li>6 - Utility types
                <ul>
                    <li><code>Partial</code>, <code>Pick</code>, <code>Omit</code>, <code>Record</code>, <code>ReturnType</code>…</li>
                </ul>
            </li>
            <li>7 - Type-level programming
                <ul>
                    <li>Mapped, conditional, template literal, recursive and branded types</li>
                </ul>
            </li>
            <li>8 - Decorators</li>
            <li>9 - Modules &amp; declaration files</li>
            <li>10 - Tooling
                <ul>
                    <li>tsconfig in depth, performance, lint, tests, docs</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training objectives

- Understand what **TypeScript checks**, when — and what it never checks
- Configure a project: **`tsconfig.json`**, `strict`, and how TypeScript code
  is **run**
- Describe a domain with **types, interfaces, classes and unions**, and let
  **narrowing** do the work
- Write **reusable, type-safe code** with generics
- **Derive** types from other types instead of writing them twice — utility,
  mapped, conditional and template literal types
- Use **decorators**, **modules** and **declaration files**
- Equip a project: lint, type tests, docs, compiler diagnostics

<br />

> This training is based on **TypeScript 7**, **Node.js 24** and **Vitest 5**.

---

# Prerequisites

- **Modern JavaScript** (ES2015+): `const` / `let`, arrow functions,
  destructuring, spread, classes, modules, `async` / `await`
- Basic use of **npm** and a terminal
- No prior experience with TypeScript
- A **laptop** with Node.js >= 22.22.2 installed (24.15+ recommended), and an
  editor with TypeScript support (VS Code, WebStorm…)

---

# Target audience

- JavaScript developers — front-end, back-end, full-stack — moving to TypeScript
- TypeScript users who want to understand the type system beyond the basics

Duration: **2 days** (14 hours)

---

# How a day runs

| Day 1 | | Day 2 | |
|---|---|---|---|
| 1 — From JS to TS | TP 1 | 6 — Utility types | TP 6 |
| 2 — Everyday types | TP 2 | 7 — Type-level programming | TP 7 |
| 3 — Classes &amp; interfaces | TP 3 | 8 — Decorators | TP 8 |
| 4 — Unions &amp; narrowing | TP 4 | 9 — Modules &amp; declaration files | TP 9 |
| 5 — Generics | TP 5 | 10 — Tooling | TP 10 |
| Retro | | Retro | |

<br />

- **Ten hands-on sessions**, each on its own standalone project — about half the time
- Each chapter closes with a **quiz** corrected together, each day with a **retro**

---

# Teaching methods

- Alternation between **theoretical lectures** and **hands-on practice**
- Workshops driven by **red specs** you turn green — runtime specs, and **type
  specs** that check the types themselves
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

- **Ten standalone workshops**, one per chapter, under `workshops/` — plain
  TypeScript projects, no UI:

```bash
cd 01_getting_started
npm install
npm run test:watch   # the given specs, red until you are done
npm run typecheck    # tsc --noEmit
```

- The code ships as a **skeleton with `// TODO` markers**; the steps are described
  in each workshop's `README.md`
- No workshop imports another: start any of them on its own
- `node check-env.mjs --install` (at the root of `workshops/`) checks your
  machine and pre-installs every workshop — ideally **run a week before** the session
