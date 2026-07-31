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

```ts
import fs from 'node:fs';

const stream = fs.createReadStream('./big.log', {
  highWaterMark: 64 * 1024, // chunk size
});

stream.on('data', (chunk: Buffer) => console.log('chunk:', chunk.length));
stream.on('end', () => console.log('done'));
stream.on('error', (err: Error) => console.error(err));
```

```ts
for await (const chunk of stream) {
  process(chunk as Buffer);
}
```

---

# Readable - custom creation

- Either by extending `Readable` or with `Readable.from(iterable)`

```ts
import { Readable } from 'node:stream';

class CounterStream extends Readable {
  private i = 0;
  constructor(private max: number) { super(); }

  _read(): void {
    if (this.i >= this.max) return void this.push(null); // end
    this.push(`${this.i++}\n`);
  }
}

new CounterStream(10).pipe(process.stdout);
```

```ts
// Simpler
const stream = Readable.from(async function* () {
  for (let i = 0; i < 10; i++) yield `${i}\n`;
}());
```

---

# Writable streams

```ts
import fs from 'node:fs';

const out = fs.createWriteStream('./out.log');

out.write('Line 1\n');
out.write('Line 2\n');
out.end(); // closes the stream

out.on('finish', () => console.log('write completed'));
```

- `write()` returns `false` if the internal buffer is full → wait for `drain` before continuing

---

# Writable - custom creation

```ts
import { Writable, type WritableOptions } from 'node:stream';

type Json = Record<string, unknown>;

class JsonLinesWriter extends Writable {
  constructor(opts?: WritableOptions) { super({ ...opts, objectMode: true }); }

  _write(obj: Json, _enc: BufferEncoding, cb: (err?: Error | null) => void): void {
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

```ts
import net from 'node:net';

const socket = net.createConnection(8080);

socket.write('PING\n');     // Writable side
socket.on('data', (chunk: Buffer) => console.log(chunk.toString())); // Readable side
```

---

# Transform streams

- Special case of Duplex: what you **write** is transformed and pushed out

```ts
import { Transform, type TransformCallback } from 'node:stream';

class UpperCase extends Transform {
  _transform(chunk: Buffer, _enc: BufferEncoding, cb: TransformCallback): void {
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

```ts
import { pipeline } from 'node:stream/promises';
import fs from 'node:fs';
import zlib from 'node:zlib';

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

```ts
import { Transform, type TransformCallback } from 'node:stream';

const parseJson = new Transform({
  readableObjectMode: true,
  writableObjectMode: false,
  transform(chunk: Buffer, _enc: BufferEncoding, cb: TransformCallback) {
    try {
      cb(null, JSON.parse(chunk.toString()));
    } catch (err) { cb(err as Error); }
  },
});
```

---

# Web Streams API

- W3C standard available in Node.js 18+
- Interoperable with Workers, Service Workers, Fetch

```ts
const stream = new ReadableStream<string>({
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
