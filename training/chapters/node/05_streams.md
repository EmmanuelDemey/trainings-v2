---
layout: cover
---

# 5 - Node.js streams

---

# Why streams?

- Process data in **chunks** without loading it entirely in memory
- Essential for:
  - Reading/writing **large files**
  - Handling **network flows** (HTTP, TCP)
  - Building **transformation pipelines** (compression, encryption, parsing)
- Built on event-driven primitives (`data`, `end`, `error`, `drain`...)

---

# The 4 stream types

| Type | Description | Example |
|------|-------------|---------|
| **Readable** | Data source | `fs.createReadStream` |
| **Writable** | Data destination | `fs.createWriteStream` |
| **Duplex** | Independent read + write | `net.Socket` |
| **Transform** | Duplex with transformation | `zlib.createGzip` |

---

# Readable streams

- Data is consumed by listening to events or with `for await ... of`

```javascript
const fs = require('node:fs');

const stream = fs.createReadStream('./big.log', {
  highWaterMark: 64 * 1024, // chunk size
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

# Readable - custom creation

- Either by extending `Readable` or with `Readable.from(iterable)`

```javascript
const { Readable } = require('node:stream');

class CounterStream extends Readable {
  constructor(max) { super(); this.i = 0; this.max = max; }

  _read() {
    if (this.i >= this.max) return this.push(null); // end
    this.push(`${this.i++}\n`);
  }
}

new CounterStream(10).pipe(process.stdout);
```

```javascript
// Simpler
const stream = Readable.from(async function* () {
  for (let i = 0; i < 10; i++) yield `${i}\n`;
}());
```

---

# Writable streams

```javascript
const fs = require('node:fs');

const out = fs.createWriteStream('./out.log');

out.write('Line 1\n');
out.write('Line 2\n');
out.end(); // closes the stream

out.on('finish', () => console.log('write completed'));
```

- `write()` returns `false` if the internal buffer is full → wait for `drain` before continuing

---

# Writable - custom creation

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

- Read **and** write, but the two sides are independent
- Typical example: `net.Socket`

```javascript
const net = require('node:net');

const socket = net.createConnection(8080);

socket.write('PING\n');     // Writable side
socket.on('data', (chunk) => console.log(chunk.toString())); // Readable side
```

---

# Transform streams

- Special case of Duplex: what you **write** is transformed and pushed out

```javascript
const { Transform } = require('node:stream');

class UpperCase extends Transform {
  _transform(chunk, _enc, cb) {
    cb(null, chunk.toString().toUpperCase());
  }
}

process.stdin.pipe(new UpperCase()).pipe(process.stdout);
```

- Built-in examples: `zlib.createGzip`, `crypto.createCipheriv`, `csv-parser`

---

# Pipelines

- `stream.pipeline` (or `pipeline` from `node:stream/promises`) chains multiple streams **with error handling**
- **Always** prefer it over `.pipe().pipe().pipe()`

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

- By default, streams work with **`Buffer`** or strings
- Enabling `objectMode: true` lets you push arbitrary JS objects

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

- W3C standard available in Node.js 18+
- Interoperable with Workers, Service Workers, Fetch

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

- Conversion Node ↔ Web: `Readable.toWeb(stream)` / `Readable.fromWeb(webStream)`

---

# Best practices

- Always use `pipeline` to propagate errors
- Pick a `highWaterMark` suited to your I/O profile
- Mind **back-pressure** (dedicated chapter)
- Prefer `for await ... of` over manual event listening for readability
- Test streams on **real, large** volumes - not 1 KB samples

---
layout: cover
---

# Hands-on

## Workshop 5 - Streams
- Read a multi-GB CSV and count lines matching a criterion
- Pipe gzip + AES encryption together
- Implement a custom Transform stream parsing JSON Lines
