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
                </ul>
            </li>
            <li>1 - Vue fundamentals recap
                <ul>
                    <li>Reactivity: <code>ref</code>, <code>computed</code>, <code>watch</code></li>
                    <li>Props, emits, <code>defineModel</code></li>
                    <li>Reactivity traps, Vue 3.5</li>
                </ul>
            </li>
            <li>2 - Advanced components
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
            <li>3 - Composables &amp; custom directives
                <ul>
                    <li>Writing reusable composables</li>
                    <li>Custom directives</li>
                    <li>Case study: image lazy loading</li>
                </ul>
            </li>
            <li>4 - Testing fundamentals
                <ul>
                    <li>Vitest &amp; <code>@vue/test-utils</code> setup</li>
                    <li>Mounting, querying, stubbing</li>
                    <li>Testing composables, spies, fake timers</li>
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
            <li>5 - Advanced routing with Vue Router
                <ul>
                    <li>Route transitions</li>
                    <li>Programmatic navigation &amp; history</li>
                    <li>Navigation guards</li>
                    <li>Case study: authentication</li>
                </ul>
            </li>
            <li>6 - State management with Pinia
                <ul>
                    <li>Optimizing stores</li>
                    <li>Global state and modules</li>
                    <li>Plugins</li>
                </ul>
            </li>
        </ul>
    </td>
    <td>
        <ul>
            <li>7 - Testing in integration &amp; e2e
                <ul>
                    <li>Testing router and Pinia dependencies</li>
                    <li>Mocking HTTP with MSW</li>
                    <li>End-to-end with Cypress</li>
                </ul>
            </li>
            <li>8 - Production &amp; deployment
                <ul>
                    <li>Code-splitting and lazy loading</li>
                    <li>Environments and server config</li>
                    <li>Continuous deployment pipeline</li>
                </ul>
            </li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training objectives

- Deepen your understanding of **key Vue.js concepts**: async components, composables
  and custom directives
- Master **routing and navigation** with Vue Router
- Efficiently manage application state with **Pinia**
- Write **unit and end-to-end tests** to guarantee code quality
- **Ship to production** and deploy Vue.js applications following best practices

<br />

> This training is based on **Vue 3.5**, **Vite 6**, **Vue Router 4**, **Pinia 3**,
> **Vitest 3** and **Cypress 14**.

---

# Prerequisites

- Having attended our **Vue.js** training, or equivalent knowledge
- Solid **development experience with Vue**
- Comfortable with **TypeScript** and modern JavaScript (ES2015+)
- A **laptop** with Node.js >= 22 installed

---

# Target audience

- Developers

Duration: **3 days**

---

# Teaching methods

- Alternation between **theoretical lectures** and **hands-on practice**
- Workshops and practical exercises
- Field experience feedback from the trainer
- Digital course materials provided

<br />

# Evaluation

- A **self-assessment questionnaire** before the session
- Continuous evaluation through **workshops, exercises and practical work**
- A **final questionnaire** mirroring the self-assessment, to measure progress

---

# TypeScript in this training

- **All code snippets are written in TypeScript** — closer to real-world projects
- Vue's Composition API was designed with type inference in mind:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);                       // Ref<number>, inferred
const double = computed(() => count.value * 2);  // ComputedRef<number>
</script>
```

- Type-check a Vue project with **`vue-tsc`**, not `tsc`:

```bash
vue-tsc --noEmit      # understands .vue single-file components
```

---

# The workshop projects

- Each chapter comes with a **standalone workshop** under `chapters/vuejs_advanced/tp/`
- Every workshop is its own Vite project — no dependency between them:

```bash
cd 02_advanced_components
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
```

- The code ships as a **skeleton with `// TODO` markers**; the steps are described
  in each workshop's `README.md`
