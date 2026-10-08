---
layout: cover
---

# Program

---

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>0 - Introduction to the training
                <ul>
                    <li>Objectives and content</li>
                    <li>Tooling and versions</li>
                    <li>Prerequisites and evaluation</li>
                </ul>
            </li>
            <li>1 - Schemas &amp; types
                <ul>
                    <li>Why TypeScript stops at the wire</li>
                    <li>Primitives, formats, objects, defaults</li>
                    <li><code>parse</code> vs <code>safeParse</code>, input vs output</li>
                </ul>
            </li>
            <li>2 - Composing schemas
                <ul>
                    <li><code>.omit</code>, <code>.pick</code>, <code>.partial</code>, <code>.extend</code></li>
                    <li>Discriminated unions, enums, records</li>
                    <li>Recursive and branded types</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>3 - Transforms &amp; refinements
                <ul>
                    <li>Coercion, <code>.transform</code>, <code>.pipe</code>, <code>.catch</code></li>
                    <li>Cross-field rules and their <code>path</code></li>
                    <li>Async checks, and codecs</li>
                </ul>
            </li>
            <li>4 - Errors at the boundaries
                <ul>
                    <li>Reading and formatting a <code>ZodError</code></li>
                    <li>Custom messages and locales</li>
                    <li>Environment, API responses, forms</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training objectives

- Understand **what TypeScript cannot check**, and where runtime validation
  belongs in an application
- Describe data with **Zod schemas**, and derive the **TypeScript types** from
  them instead of writing them twice
- **Compose** a domain out of schemas: derived bodies, unions, records, trees
- **Parse, don't validate**: coerce, transform and normalise in the schema
- Write **cross-field** and **async** rules that report on the right field
- Turn a `ZodError` into **messages a human can act on** — a developer, an
  operator, a user filling in a form

<br />

> This training is based on **Zod 4.6**, **TypeScript 7** and **Vitest 5**.

---

# Prerequisites

- Comfortable with **TypeScript**: generics, unions, `typeof`, type inference
- Modern JavaScript (ES2015+), `async` / `await`
- No prior experience with Zod — or with **Zod 3** only: the differences are
  called out as they come
- A **laptop** with Node.js >= 22.22.2 installed (24.15+ recommended)

---

# Target audience

- Front-end, back-end and full-stack TypeScript developers

Duration: **half a day** (≈ 3h50 with a break)

---

# How the half-day runs

| | Chapter | Hands-on |
|---|---|---|
| **0:10** | 1 — Schemas & types | TP 1 — 25 min |
| **0:55** | 2 — Composing schemas | TP 2 — 30 min |
| **1:45** | *Break* | |
| **2:00** | 3 — Transforms & refinements | TP 3 — 30 min |
| **2:55** | 4 — Errors at the boundaries | TP 4 — 25 min |
| **3:40** | Retro | |

<br />

- **Four hands-on sessions**, each on its own standalone project — more than
  half the time
- Each chapter closes with a **quiz** corrected together, the session with a **retro**

---

# Teaching methods

- Alternation between **theoretical lectures** and **hands-on practice**
- Workshops driven by **red specs** you turn green
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

- **Four standalone workshops**, one per chapter, under `workshops/` — plain
  TypeScript projects, no UI, no server:

```bash
cd 01_schemas
npm install
npm run test:watch   # the given specs, red until you are done
npm run typecheck    # tsc --noEmit
```

- The code ships as a **skeleton with `// TODO` markers**; the steps are described
  in each workshop's `README.md`
- One domain throughout — a **concert ticketing** app — but no workshop imports
  another
- `node check-env.mjs --install` (at the root of `workshops/`) checks your
  machine and pre-installs every workshop — ideally **run a week before** the session
