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
            <li>1 - Vue Devtools
                <ul>
                    <li>Install, and the Vite plugin</li>
                    <li>Components, Timeline, measuring a render</li>
                    <li>Editing component state live</li>
                </ul>
            </li>
            <li>2 - Composables &amp; custom directives
                <ul>
                    <li>Writing reusable composables</li>
                    <li>Custom directives</li>
                    <li>Cleanup, shared state and VueUse</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>3 - Testing fundamentals
                <ul>
                    <li>Vitest &amp; <code>@vue/test-utils</code> setup</li>
                    <li>Mounting, querying, stubbing</li>
                    <li>Spies with <code>using</code>, and fake timers</li>
                </ul>
            </li>
            <li>4 - Anatomy of a Vue plugin
                <ul>
                    <li><code>app.use</code> and the <code>install</code> contract</li>
                    <li>Injection, options and app-level state</li>
                    <li>Failing loudly when the plugin is missing</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>5 - Anatomy of a team composable library
                <ul>
                    <li>What belongs in a shared library</li>
                    <li>Signature, return value and cleanup conventions</li>
                    <li>The rule of three, and the team contract</li>
                </ul>
            </li>
            <li>6 - Advanced routing with Vue Router
                <ul>
                    <li>Named routes and typed <code>meta</code></li>
                    <li>Programmatic navigation &amp; history</li>
                    <li>Navigation guards, authentication</li>
                </ul>
            </li>
            <li>7 - Advanced components
                <ul>
                    <li>Async components &amp; <code>Suspense</code></li>
                    <li>Named and scoped slots</li>
                    <li><code>v-once</code> and <code>v-memo</code></li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>8 - The <code>unplugin-*</code> ecosystem
                <ul>
                    <li>File-based &amp; typed routing</li>
                    <li>Auto-imports of APIs and components</li>
                    <li>Vue plugin vs unplugin: runtime vs build time</li>
                </ul>
            </li>
            <li>9 - State management with Pinia
                <ul>
                    <li>Optimizing stores</li>
                    <li>Global state and modules</li>
                    <li>Plugins</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>10 - Transition &amp; TransitionGroup
                <ul>
                    <li>The six classes, on the enter / leave timeline</li>
                    <li>Modes: default, <code>out-in</code>, <code>in-out</code></li>
                    <li><code>TransitionGroup</code> and the FLIP <code>v-move</code></li>
                </ul>
            </li>
            <li>11 - Forms &amp; validation
                <ul>
                    <li>Schemas with Zod, a <code>useForm</code> from scratch</li>
                    <li>VeeValidate and <code>toTypedSchema</code></li>
                    <li>Async rules, server errors, accessibility</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>12 - Testing in integration &amp; e2e
                <ul>
                    <li>Testing router and Pinia dependencies</li>
                    <li>Mocking HTTP with MSW</li>
                    <li>End-to-end with Cypress</li>
                </ul>
            </li>
            <li>13 - Error handling &amp; observability
                <ul>
                    <li><code>onErrorCaptured</code> and <code>&lt;ErrorBoundary&gt;</code></li>
                    <li><code>app.config.errorHandler</code>, the global net</li>
                    <li>What Vue never sees: timers and promises</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

<table>
<tbody>
 <tr style="border: 0; font-size: 0.95em">
    <td>
        <ul>
            <li>14 - Component architecture &amp; duplication
                <ul>
                    <li>Feature-first layout and the dependency rule</li>
                    <li>Props explosion, slots, generic components</li>
                    <li>Three kinds of duplication, one wrong abstraction</li>
                </ul>
            </li>
            <li>15 - Internationalization with vue-i18n
                <ul>
                    <li>Pluralization, and <code>Intl</code> number formats</li>
                    <li>Lazy-loaded locales, without the races</li>
                    <li>The traps, on one slide</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>16 - Production &amp; deployment
                <ul>
                    <li>Code-splitting and lazy loading</li>
                    <li>Environments and server config</li>
                    <li>Continuous deployment pipeline</li>
                </ul>
            </li>
            <li>17 - Final project &amp; cross-review <em>(optional)</em>
                <ul>
                    <li>One vertical slice, seven steps, in pairs</li>
                    <li>Freeze, then review another pair's code</li>
                    <li>Three findings each, then the debrief</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training objectives

- Build **reusable code** with composables, custom directives and plugins, and
  **test** it from the third chapter onwards
- Deepen your understanding of **key Vue.js concepts**: async components,
  `Suspense`, scoped slots
- Master **routing and navigation** with Vue Router, up to **file-based typed
  routes**
- Efficiently manage application state with **Pinia**
- Build **typed, validated and accessible forms** with Zod and VeeValidate
- **Ship to production** and deploy Vue.js applications following best practices

<br />

> This training is based on **Vue 3.5**, **Vite 8**, **Vue Router 5**, **Pinia 4**,
> **Zod 3**, **VeeValidate 4**, **Vitest 5** and **Cypress 15**.

---

# Prerequisites

- Having attended our **Vue.js** training, or equivalent knowledge
- Solid **development experience with Vue**
- Comfortable with **TypeScript** and modern JavaScript (ES2015+)
- A **laptop** with Node.js >= 22.22.2 installed (24.15+ recommended)
- The **Vue Devtools** browser extension (Chrome or Firefox) — we use it from the
  first hour

---

# Target audience

- Developers

Duration: **3 days**

---

# How the three days run

| | Chapters | Hands-on |
|---|---|---|
| **Day 1** | 0 → 5 — devtools, composables, testing, plugins, shared library | Guided tour · TP 2 · TP 3 |
| **Day 2** | 6 → 10 — router, advanced components, unplugin, Pinia, transitions | TP 6 · TP 7 · TP 9 |
| **Day 3** | 11 → 17 — forms, integration testing, errors, architecture, i18n, production | TP 11 · TP 16 · final project |

<br />

- **Nine hands-on sessions**, on eight standalone projects — roughly half the time
- Each chapter closes with a **quiz** corrected together, each day with a **retro**
- The deck also carries **appendices**: the deep dives, long case studies and
  packaging corners each chapter used to hold inline. They sit **outside** the
  three days on purpose — read them afterwards, or ask for one if the room wants
  to push further

---

# Teaching methods

- Alternation between **theoretical lectures** and **hands-on practice**
- Workshops and practical exercises
- Field experience feedback from the trainer
- Digital course materials provided

<br />

# Evaluation

- A **self-assessment questionnaire** before the session
- A short **formative quiz** closing each chapter, corrected together
- Continuous evaluation through **workshops, exercises and practical work**
- A **final questionnaire** mirroring the self-assessment, to measure progress

---

# The workshop projects

- **Eight standalone workshops** under `chapters/vuejs_advanced/tp/`, each its own
  Vite project — no dependency between them:

```bash
cd 02_composables_directives
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
```

- The code ships as a **skeleton with `// TODO` markers**; the steps are described
  in each workshop's `README.md`
- Several chapters **come back to a project you already have**. Those extensions
  live in the same `README.md`, and are yours to do **after the session**
- `node check-env.mjs --install` (at the root of `tp/`) checks your machine and
  pre-installs every workshop — ideally **run a week before** the session
