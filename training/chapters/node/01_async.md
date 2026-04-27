---
layout: cover
---

# 1 - Dompter le paradigme asynchrone

---

# Pourquoi l'asynchrone ?

- Node.js est **mono-thread** par défaut
- Bloquer le thread principal = bloquer toutes les requêtes
- Toutes les opérations d'**I/O** (fichier, réseau, DB) sont **non bloquantes**

```javascript
// Bloquant - à éviter
const data = fs.readFileSync('./big.json');

// Non bloquant - à privilégier
fs.readFile('./big.json', (err, data) => { ... });

// Promise / async-await
const data = await fs.promises.readFile('./big.json');
```

---

# Avantages de l'asynchrone

- **Scalabilité** : un seul thread peut gérer des milliers de connexions
- **Empreinte mémoire** réduite (pas un thread par requête comme en Java/PHP)
- Modèle **event-driven** naturel pour des serveurs HTTP, websockets, IoT, etc.
- Composabilité avec les **streams** et les **EventEmitter**

---

# Pièges à éviter

- Le **callback hell**

```javascript
fs.readFile(file, (err, data) => {
  parse(data, (err, json) => {
    save(json, (err, id) => {
      notify(id, (err) => {
        // ...
      });
    });
  });
});
```

- L'oubli du `return` ou du `await` (la promise est ignorée silencieusement)
- Les exceptions levées à l'intérieur d'un callback async qui crashent le process
- L'ordre d'exécution **non intuitif** entre `setTimeout`, `setImmediate`, `process.nextTick` et microtasks

---

# Callbacks - convention Node.js

- Le premier argument est **toujours l'erreur** (convention `errback`)
- Les arguments suivants sont les valeurs de retour

```javascript
const fs = require('node:fs');

fs.readFile('./config.json', 'utf-8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

- Les modules récents proposent une version `promise` accessible via `require('node:fs/promises')` ou `require('node:fs').promises`

---

# Promises

- Une **Promise** représente un traitement asynchrone à venir
- Trois états : `pending`, `fulfilled`, `rejected`
- On attache des traitements via `.then()`, `.catch()`, `.finally()`

```javascript
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(users => console.log(users))
  .catch(err => console.error(err))
  .finally(() => console.log('done'));
```

---

# Promises - création

```javascript
const wait = (ms) => new Promise((resolve, reject) => {
  if (ms < 0) {
    reject(new Error('Invalid delay'));
    return;
  }
  setTimeout(resolve, ms);
});

await wait(1000);
```

- `Promise.resolve(value)` / `Promise.reject(error)` permettent de construire directement une promise résolue/rejetée

---

# Promises - utilitaires

| Méthode | Comportement |
|---------|--------------|
| `Promise.all([...])` | Résout quand toutes ok, rejette à la première erreur |
| `Promise.allSettled([...])` | Attend toutes (ok ou ko) et retourne leur statut |
| `Promise.race([...])` | Résout/rejette dès la première promise terminée |
| `Promise.any([...])` | Résout dès la première promise réussie |

```javascript
const [user, orders] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
]);
```

---

# async / await

- Sucre syntaxique au-dessus des Promises
- Une fonction `async` retourne **toujours** une Promise
- `await` ne peut s'utiliser **que** dans une fonction `async` (ou top-level dans un module ESM)

```javascript
const loadUser = async (id) => {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Not found');
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
```

---

# async / await - parallélisme

- `await` séquentiel par défaut

```javascript
// Séquentiel - lent
const user = await fetchUser(id);
const orders = await fetchOrders(id);
```

- Pour paralléliser, on lance d'abord les promises puis on les `await` ensemble

```javascript
// Parallèle - rapide
const userPromise = fetchUser(id);
const ordersPromise = fetchOrders(id);
const user = await userPromise;
const orders = await ordersPromise;

// Ou plus simplement
const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);
```

---

# Conversion callback ➜ Promise

- L'utilitaire **`util.promisify`** transforme une fonction callback en fonction qui retourne une Promise

```javascript
const { promisify } = require('node:util');
const fs = require('node:fs');

const readFile = promisify(fs.readFile);

const data = await readFile('./data.json', 'utf-8');
```

- Inversement, `util.callbackify` adapte une promise vers une signature callback

---

# Top-level await

- Disponible dans les modules ESM (`type: module` dans `package.json` ou fichier `.mjs`)
- Permet d'éviter de wrapper le code dans une IIFE async

```javascript
// app.mjs
import { connect } from './db.js';

const db = await connect();
console.log('connected');
```

- Attention : retarde le chargement du module ; à utiliser avec parcimonie

---

# Le futur avec ES-Next

- **Promise.withResolvers()** (ES2024) - création de Promise avec accès direct à `resolve`/`reject`

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

emitter.once('data', resolve);
emitter.once('error', reject);

const data = await promise;
```

- **Iterator helpers** asynchrones (ES2025) - `.map`, `.filter`, `.take`, `.toArray` sur des `AsyncIterator`
- **Explicit Resource Management** (`using`, `await using`)

---

# Async iterators

- Permettent de consommer un flux asynchrone avec `for await ... of`

```javascript
const fs = require('node:fs');

const stream = fs.createReadStream('./log.txt', { encoding: 'utf-8' });

for await (const chunk of stream) {
  console.log('chunk:', chunk.length);
}
```

- Implémentation manuelle via `Symbol.asyncIterator`

---

# AbortController

- Norme web reprise par Node.js pour **annuler** les opérations asynchrones

```javascript
const controller = new AbortController();
const { signal } = controller;

setTimeout(() => controller.abort(), 5000);

try {
  const res = await fetch('https://slow.example.com', { signal });
  const body = await res.text();
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Requête annulée');
  }
}
```

---

# Code synchrone vs asynchrone

| Synchrone | Asynchrone |
|-----------|------------|
| `fs.readFileSync` | `fs.readFile` / `fs.promises.readFile` |
| `crypto.pbkdf2Sync` | `crypto.pbkdf2` |
| `child_process.execSync` | `child_process.exec` |

- Les API `Sync` ne doivent être utilisées **qu'au démarrage** (chargement de configuration) ou dans des scripts CLI
- Dans un serveur HTTP, elles bloquent toutes les requêtes en cours

---
layout: cover
---

# Travaux Pratiques

## Atelier 1 - Asynchrone
- Réécrire un script callback en async/await
- Paralléliser des appels HTTP avec `Promise.all`
- Mettre en place un timeout via `AbortController`
