import { Readable, Writable } from "node:stream";
// import { pipeline } from "node:stream/promises";

/**
 * A fast source: emits a large number of chunks as quickly as possible.
 */
function fastSource(chunks: number, size: number): Readable {
  let emitted = 0;
  return new Readable({
    read() {
      if (emitted >= chunks) {
        this.push(null);
        return;
      }
      emitted++;
      // A non-trivial payload so the buffer is easy to observe in RSS.
      this.push(Buffer.alloc(size, "x"));
    },
  });
}

/**
 * A deliberately slow sink: each write takes ~5ms to "flush".
 */
function slowSink(): Writable {
  return new Writable({
    write(_chunk, _encoding, callback) {
      setTimeout(callback, 5);
    },
  });
}

function rssMb(): string {
  return (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
}

async function main(): Promise<void> {
  const source = fastSource(100_000, 64 * 1024); // ~6.4 GB worth of chunks
  const sink = slowSink();

  const interval = setInterval(() => console.log(`RSS: ${rssMb()} MB`), 200);

  // ❌ Naïve version — ignores the return value of write(): the source is never
  // paused, so chunks pile up in the writable's internal buffer and RSS climbs.
  source.on("data", (chunk: Buffer) => {
    sink.write(chunk);
  });

  await new Promise<void>((resolve) => source.on("end", resolve));

  // TODO: replace the naïve loop above with a back-pressure-aware solution.
  //   Option A: await pipeline(source, sink) from "node:stream/promises".
  //   Option B: keep the manual loop but honour write()'s return value —
  //             when it returns false, stop and wait for the "drain" event
  //             before writing again.
  //   Goal: RSS must stay roughly flat instead of growing unbounded.

  clearInterval(interval);
  console.log(`done — final RSS: ${rssMb()} MB`);
}

await main();
