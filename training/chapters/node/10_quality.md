---
layout: cover
---

# 10 - Contrôle de qualité

---

# Trois piliers

1. **Debug** : reproduire et inspecter un bug
2. **Profiling** : mesurer les performances
3. **Qualité du code** : prévenir les bugs en amont

---

# Debugger V8

- Node embarque le **Inspector Protocol** (même que Chrome DevTools)

```bash
node --inspect server.js          # debug attachable
node --inspect-brk server.js      # break sur la 1ère ligne
```

- Connexion :
  - **Chrome** : `chrome://inspect`
  - **VS Code** : extension "JavaScript Debug" (intégrée)
  - **WebStorm**, **JetBrains** : configuration "Attach to Node"
  - **`ndb`** : DevTools standalone

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

# Outils externes

- **node --inspect** + Chrome DevTools : debugger, profiler, heap snapshots
- **clinic.js** : suite de profilers (doctor, flame, bubbleprof, heap)
- **0x** : flamegraphs CPU
- **autocannon**, **wrk** : load testing
- **why-is-node-running** : trouver ce qui empêche le process de s'arrêter
- **NODE_DEBUG** : logs internes (`NODE_DEBUG=net,http node app.js`)

---

# Profiling - rappel

```bash
# CPU sampling natif
node --cpu-prof --cpu-prof-dir=./profiles app.js

# Heap profile
node --heap-prof --heap-prof-dir=./profiles app.js

# Flamegraph
0x -- node app.js
```

- Charger les `.cpuprofile` / `.heapprofile` dans **Chrome DevTools → Performance / Memory**

---

# Qualité du code - linting

- **ESLint** : standard pour JavaScript/TypeScript
  - Plugins : `eslint-plugin-node`, `eslint-plugin-security`, `eslint-plugin-promise`
- Configurations recommandées : **`@eslint/js`**, **`eslint-config-standard`**, **`@typescript-eslint`**

```bash
npm i -D eslint @eslint/js
npx eslint --init
```

---

# Qualité du code - format

- **Prettier** : formatter opinionated
- Couplage avec ESLint via `eslint-config-prettier` (désactive les règles de style en conflit)
- Lancement automatique au commit via **Husky** + **lint-staged**

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"]
  }
}
```

---

# Qualité du code - typage

- **TypeScript** apporte un typage statique fort
- Alternative : **JSDoc** + `// @ts-check` pour conserver du JS pur
- Validation runtime aux frontières : **`zod`**, **`ajv`**, **`io-ts`**, **`arktype`**

```typescript
import { z } from 'zod';

const UserSchema = z.object({ id: z.number(), email: z.string().email() });
type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(req.body); // throw si invalide
```

---

# Qualité - audits sécurité

- **`npm audit`** / **`pnpm audit`** : vulnérabilités connues sur les dépendances
- **Snyk**, **Socket.dev**, **Dependabot**, **Renovate** : alertes automatiques
- **`npm-check-updates`** : suivre les versions
- **`knip`** : détecte les exports / dépendances inutilisés
- **SAST** : SonarQube, CodeQL

---

# Gestion des erreurs

- En Node.js, plusieurs canaux d'erreurs :
  - **throw** synchrone
  - **callback `(err, ...)`**
  - **promise rejetée**
  - **`error` event** sur EventEmitter
  - **`uncaughtException`** / **`unhandledRejection`** au niveau process
- Une erreur non gérée peut **crasher** le process

---

# Erreurs - bonnes pratiques

- Étendre `Error` pour des erreurs **typées**

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

- Distinguer **opérationnelles** (réseau down, validation) des **bugs** (TypeError, accès undefined)
- Pour les bugs → laisser **crasher** le process et relancer (PM2, Kubernetes)

---

# Erreurs globales

```javascript
process.on('uncaughtException', (err) => {
  logger.fatal(err, 'uncaughtException');
  // après log : on quitte
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error(reason, 'unhandledRejection');
});

// Node 15+ : unhandledRejection => process.exit(1) par défaut
```

- Pour `unhandledRejection`, on peut configurer `--unhandled-rejections=strict|warn|none`

---

# AsyncLocalStorage pour le contexte

- Permet d'attacher un **contexte** (request id, user id, locale...) à une chaîne async sans le passer en paramètre

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

- **`pino`** : très rapide, JSON par défaut
- **`winston`** : ancien, très flexible
- **`bunyan`** : JSON, transport multiple

```javascript
const pino = require('pino');
const logger = pino({ level: 'info' });

logger.info({ userId: 1 }, 'login');
logger.error(err, 'request failed');
```

- Toujours produire des **logs structurés** (JSON) pour les pipelines d'observabilité

---

# Observabilité - les 3 piliers

- **Logs** : événements discrets (pino, winston)
- **Metrics** : valeurs numériques (Prometheus, OpenTelemetry)
- **Traces** : suivi distribué (OpenTelemetry, Jaeger, Zipkin)

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

# Travaux Pratiques

## Atelier 10 - Qualité
- Configurer ESLint + Prettier + Husky + lint-staged
- Implémenter une hiérarchie d'erreurs HTTP
- Ajouter un middleware de logging avec `pino` + AsyncLocalStorage
