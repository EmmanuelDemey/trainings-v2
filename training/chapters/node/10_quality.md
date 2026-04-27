---
layout: cover
---

# 10 - Quality control

---

# Three pillars

1. **Debug**: reproduce and inspect a bug
2. **Profiling**: measure performance
3. **Code quality**: prevent bugs upstream

---

# V8 Debugger

- Node embeds the **Inspector Protocol** (the same Chrome DevTools uses)

```bash
node --inspect server.js          # attachable debugger
node --inspect-brk server.js      # break on the first line
```

- Connection:
  - **Chrome**: `chrome://inspect`
  - **VS Code**: built-in "JavaScript Debug" extension
  - **WebStorm**, **JetBrains**: "Attach to Node" configuration
  - **`ndb`**: standalone DevTools

---

# VS Code launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Server",
      "program": "${workspaceFolder}/server.js",
      "skipFiles": ["<node_internals>/**"],
      "env": { "NODE_ENV": "development" }
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach",
      "port": 9229
    }
  ]
}
```

---

# External tools

- **node --inspect** + Chrome DevTools: debugger, profiler, heap snapshots
- **clinic.js**: profiler suite (doctor, flame, bubbleprof, heap)
- **0x**: CPU flamegraphs
- **autocannon**, **wrk**: load testing
- **why-is-node-running**: find what prevents the process from exiting
- **NODE_DEBUG**: internal logs (`NODE_DEBUG=net,http node app.js`)

---

# Profiling - recap

```bash
# Native CPU sampling
node --cpu-prof --cpu-prof-dir=./profiles app.js

# Heap profile
node --heap-prof --heap-prof-dir=./profiles app.js

# Flamegraph
0x -- node app.js
```

- Open the `.cpuprofile` / `.heapprofile` files in **Chrome DevTools → Performance / Memory**

---

# Code quality - linting

- **ESLint**: standard for JavaScript/TypeScript
  - Plugins: `eslint-plugin-node`, `eslint-plugin-security`, `eslint-plugin-promise`
- Recommended configurations: **`@eslint/js`**, **`eslint-config-standard`**, **`@typescript-eslint`**

```bash
npm i -D eslint @eslint/js
npx eslint --init
```

---

# Code quality - formatting

- **Prettier**: opinionated formatter
- Pair with ESLint via `eslint-config-prettier` (disables conflicting style rules)
- Run automatically on commit via **Husky** + **lint-staged**

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

---

# Code quality - typing

- **TypeScript** brings strong static typing
- Alternative: **JSDoc** + `// @ts-check` to keep pure JS
- Runtime validation at boundaries: **`zod`**, **`ajv`**, **`io-ts`**, **`arktype`**

```typescript
import { z } from 'zod';

const UserSchema = z.object({ id: z.number(), email: z.string().email() });
type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(req.body); // throws if invalid
```

---

# Quality - security audits

- **`npm audit`** / **`pnpm audit`**: known dependency vulnerabilities
- **Snyk**, **Socket.dev**, **Dependabot**, **Renovate**: automated alerts
- **`npm-check-updates`**: track versions
- **`knip`**: detects unused exports / dependencies
- **SAST**: SonarQube, CodeQL

---

# Error handling

- In Node.js there are several error channels:
  - Synchronous **throw**
  - **`(err, ...)`** callback
  - **Rejected promise**
  - **`error` event** on EventEmitter
  - **`uncaughtException`** / **`unhandledRejection`** at the process level
- An unhandled error can **crash** the process

---

# Errors - best practices

- Extend `Error` to define **typed** errors

```javascript
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

throw new HttpError(404, 'User not found');
```

- Distinguish **operational errors** (network down, validation) from **bugs** (TypeError, undefined access)
- For bugs → let the process **crash** and restart it (PM2, Kubernetes)

---

# Global errors

```javascript
process.on('uncaughtException', (err) => {
  logger.fatal(err, 'uncaughtException');
  // after logging: exit
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(reason, 'unhandledRejection');
});

// Node 15+: unhandledRejection => process.exit(1) by default
```

- For `unhandledRejection`, configure via `--unhandled-rejections=strict|warn|none`

---

# AsyncLocalStorage for context

- Attach a **context** (request id, user id, locale...) to an async chain without passing it as a parameter

```javascript
const { AsyncLocalStorage } = require('node:async_hooks');

const als = new AsyncLocalStorage();

app.use((req, res, next) => {
  als.run({ requestId: req.headers['x-request-id'] }, next);
});

logger.info = (msg) => {
  const ctx = als.getStore();
  console.log(JSON.stringify({ msg, ...ctx }));
};
```

---

# Logging

- **`pino`**: very fast, JSON by default
- **`winston`**: older, very flexible
- **`bunyan`**: JSON, multiple transports

```javascript
const pino = require('pino');
const logger = pino({ level: 'info' });

logger.info({ userId: 1 }, 'login');
logger.error(err, 'request failed');
```

- Always emit **structured logs** (JSON) for observability pipelines

---

# Observability - the 3 pillars

- **Logs**: discrete events (pino, winston)
- **Metrics**: numerical values (Prometheus, OpenTelemetry)
- **Traces**: distributed tracing (OpenTelemetry, Jaeger, Zipkin)

```javascript
// OpenTelemetry SDK
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
}).start();
```

---
layout: cover
---

# Hands-on

## Workshop 10 - Quality
- Configure ESLint + Prettier + Husky + lint-staged
- Implement an HTTP error hierarchy
- Add a logging middleware with `pino` + AsyncLocalStorage
