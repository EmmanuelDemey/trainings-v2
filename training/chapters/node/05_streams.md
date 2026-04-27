---
layout: cover
---

# 5 - Streams Node.js

---

# Pourquoi les streams ?

- Traiter une donnée **par morceaux** sans la charger entièrement en mémoire
- Indispensables pour :
  - Lire/écrire des **gros fichiers**
  - Manipuler des **flux réseau** (HTTP, TCP)
  - Brancher des **transformations** en pipeline (compression, chiffrement, parsing)
- Reposent sur l'event-driven (`data`, `end`, `error`, `drain`...)

---

# Les 4 types de streams

| Type | Description | Exemple |
|------|-------------|---------|
| **Readable** | Source de données | `fs.createReadStream` |
| **Writable** | Destination de données | `fs.createWriteStream` |
| **Duplex** | Lecture + écriture indépendantes | `net.Socket` |
| **Transform** | Duplex avec transformation | `zlib.createGzip` |

---

# Readable streams

- On lit la donnée en se mettant à l'écoute des événements ou en utilisant `for await ... of`

```javascript
const fs = require('node:fs');

const stream = fs.createReadStream('./big.log', {
  highWaterMark: 64 * 1024, // taille des chunks
});

stream.on('data', (chunk) => console.log('chunk:', chunk.length));
stream.on('end', () => console.log('done'));
stream.on('error', (err) => console.error(err));
```

```javascript
for await (const chunk of stream) {
  process(chunk);
}
```

---

# Readable - création custom

- En étendant `Readable` ou via `Readable.from(iterable)`

```javascript
const { Readable } = require('node:stream');

class CounterStream extends Readable {
  constructor(max) { super(); this.i = 0; this.max = max; }

  _read() {
    if (this.i >= this.max) return this.push(null); // fin
    this.push(`${this.i++}\n`);
  }
}

new CounterStream(10).pipe(process.stdout);
```

```javascript
// Plus simple
const stream = Readable.from(async function* () {
  for (let i = 0; i < 10; i++) yield `${i}\n`;
}());
```

---

# Writable streams

```javascript
const fs = require('node:fs');

const out = fs.createWriteStream('./out.log');

out.write('Ligne 1\n');
out.write('Ligne 2\n');
out.end(); // ferme le stream

out.on('finish', () => console.log('écriture terminée'));
```

- `write()` retourne `false` si le buffer interne est plein → écouter `drain` avant de continuer

---

# Writable - création custom

```javascript
const { Writable } = require('node:stream');

class JsonLinesWriter extends Writable {
  constructor(opts) { super({ ...opts, objectMode: true }); }

  _write(obj, _enc, cb) {
    process.stdout.write(JSON.stringify(obj) + '\n', cb);
  }
}

const w = new JsonLinesWriter();
w.write({ event: 'login', user: 'manu' });
w.end();
```

---

# Duplex streams

- Lecture **et** écriture, mais les deux côtés sont indépendants
- Exemple typique : `net.Socket`

```javascript
const net = require('node:net');

const socket = net.createConnection(8080);

socket.write('PING\n');     // côté Writable
socket.on('data', (chunk) => console.log(chunk.toString())); // côté Readable
```

---

# Transform streams

- Cas particulier de Duplex : ce qu'on **écrit** est transformé puis poussé en sortie

```javascript
const { Transform } = require('node:stream');

class UpperCase extends Transform {
  _transform(chunk, _enc, cb) {
    cb(null, chunk.toString().toUpperCase());
  }
}

process.stdin.pipe(new UpperCase()).pipe(process.stdout);
```

- Exemples natifs : `zlib.createGzip`, `crypto.createCipheriv`, `csv-parser`

---

# Pipelines

- `stream.pipeline` (ou `pipeline` from `node:stream/promises`) : chaîne plusieurs streams **avec gestion des erreurs**
- Préférer **toujours** à `.pipe().pipe().pipe()`

```javascript
const { pipeline } = require('node:stream/promises');
const fs = require('node:fs');
const zlib = require('node:zlib');

await pipeline(
  fs.createReadStream('./big.log'),
  zlib.createGzip(),
  fs.createWriteStream('./big.log.gz'),
);
```

---

# Object mode

- Par défaut, les streams travaillent avec des **`Buffer`** ou des **strings**
- En activant `objectMode: true`, on peut faire passer des objets JS arbitraires

```javascript
const { Transform } = require('node:stream');

const parseJson = new Transform({
  readableObjectMode: true,
  writableObjectMode: false,
  transform(chunk, _enc, cb) {
    try {
      cb(null, JSON.parse(chunk));
    } catch (err) { cb(err); }
  },
});
```

---

# Web Streams API

- API standard W3C disponible dans Node.js 18+
- Inter-opérable avec les Workers, Service Workers, Fetch

```javascript
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('hello');
    controller.enqueue('world');
    controller.close();
  },
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

- Conversion Node ↔ Web : `Readable.toWeb(stream)` / `Readable.fromWeb(webStream)`

---

# Bonnes pratiques

- Toujours utiliser `pipeline` pour propager les erreurs
- Définir un `highWaterMark` adapté à votre I/O
- Penser au **back-pressure** (chapitre dédié)
- Préférer `for await ... of` à l'écoute manuelle des événements pour la lisibilité
- Tester les streams sur des **gros volumes** réels, pas sur 1 ko

---
layout: cover
---

# Travaux Pratiques

## Atelier 5 - Streams
- Lire un CSV de plusieurs Go et compter les lignes correspondant à un critère
- Brancher gzip + chiffrement AES en pipeline
- Implémenter un Transform stream custom pour parser du JSON Lines
