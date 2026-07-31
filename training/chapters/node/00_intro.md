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
            <li>1 - Advanced JavaScript: 
                <ul>
                    <li>The async paradigm</li>
                    <li>Promises / async-await</li>
                    <li>ES-Next</li>
                </ul>
            </li>
            <li>2 - Node.js internal architecture
                <ul>
                    <li>Single-thread &amp; Event Loop</li>
                    <li>libuv and the thread pool</li>
                </ul>
            </li>
            <li>3 - Node.js events (event-driven)</li>
            <li>4 - Express framework
                <ul>
                    <li>Routing</li>
                    <li>Guards / Authentication</li>
                </ul>
            </li>
            <li>5 - Node.js streams</li>
            <li>6 - Tests (Mocha, Jest, mocks, e2e)</li>
        </ul>
    </td>
    <td>
        <ul>
            <li>7 - Performance &amp; memory</li>
            <li>8 - Clusters &amp; Worker Threads</li>
            <li>9 - Advanced flows
                <ul>
                    <li>Back-pressure</li>
                    <li>AMQP</li>
                    <li>Redis Pub/Sub</li>
                </ul>
            </li>
            <li>10 - Quality control
                <ul>
                    <li>V8 debugger</li>
                    <li>Profiling</li>
                    <li>Error handling</li>
                </ul>
            </li>
            <li>11 - Advanced modules
                <ul>
                    <li>Async Hooks, Buffer, Crypto, FS...</li>
                </ul>
            </li>
            <li>12 - Native addons (C++, Node-API)</li>
        </ul>
    </td>
 </tr>
 </tbody>
</table>

---

# Training objectives

- Understand the **internal workings** of Node.js
- Apply advanced **best practices** for development
- **Optimize** the performance of your applications
- **Improve the quality** of your applications

<br />

> This training is based on **Node.js 24 LTS** (V8 13.6, npm 11).

---

# Prerequisites

- Advanced mastery of **JavaScript**
- Understanding of **basic Node.js** concepts
- Hands-on experience building **Node.js** applications
- Node.js environment setup

---

# Target audience

- Software architects
- Project managers
- Developers

Duration: **3 days**

---

# Teaching methods

- Alternation between **theoretical lectures** and **hands-on practice**
- Workshops and practical exercises
- Field experience feedback from the trainer
- Digital course materials provided
- Continuous evaluation (self-assessment questionnaire, workshops, exercises, final questionnaire)

---

# TypeScript in this training

- **All code snippets are written in TypeScript** — typed, closer to real-world projects
- Since **Node.js 24**, you can run `.ts` files **directly**, no build step:

```bash
node app.ts          # type annotations are stripped at runtime
```

- Node strips the types ("type stripping") and executes the resulting JavaScript
- No `tsx` / `ts-node` / `esbuild` required for the workshops
- `tsc` is still used **for type-checking** (`tsc --noEmit`), not for running

---

# How type stripping works

- Node.js removes the type syntax and runs the rest — **it does not type-check**
- Only **erasable** TypeScript is allowed by default (no runtime emit):
  - ✅ type annotations, `interface`, `type`, `as`, generics, `import type`
  - ❌ `enum`, `namespace` with values, constructor `parameter properties`
    - (need the flag `--experimental-transform-types`)
- Prefer `import type { Foo } from './foo.ts'` for type-only imports
- Use **explicit `.ts` extensions** in relative imports

```ts
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { handler } from './handler.ts';
```

---

# Configuring TypeScript in the project

Install the type definitions for the Node.js API:

```bash
npm install --save-dev typescript @types/node
```

`tsconfig.json` aligned with Node.js 24 native execution:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "lib": ["esnext"],
    "types": ["node"],
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true,
    "noEmit": true,
    "strict": true
  }
}
```

- `erasableSyntaxOnly` ➜ fails fast on non-strippable syntax (`enum`...)
- `verbatimModuleSyntax` ➜ keeps `import`/`import type` exactly as written
- `noEmit` ➜ `tsc` is type-checker only; **Node runs the `.ts` directly**
