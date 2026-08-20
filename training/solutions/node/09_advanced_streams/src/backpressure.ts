// STEP 1 — Reproduce a back-pressure bug, then fix it two ways.
//
//   node src/backpressure.ts            # runs the three variants, side by side
//   node src/backpressure.ts naive      # a single variant, in this process
//
// Each variant runs in its OWN child process. That is not ceremony: RSS never
// goes back down after the naïve run buffers a few hundred MB, so measuring all
// three in one process would credit the fix with the mess the bug left behind.

import { Readable, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fork } from "node:child_process";
import { fileURLToPath } from "node:url";

const CHUNKS = 4_000;
const CHUNK_SIZE = 64 * 1024; // ~256 MB in total
const SINK_DELAY_MS = 5;

/** A fast source: emits a large number of chunks as quickly as possible. */
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

/** A deliberately slow sink: each write takes ~5ms to "flush". */
function slowSink(): Writable {
  return new Writable({
    write(_chunk, _encoding, callback) {
      setTimeout(callback, SINK_DELAY_MS);
    },
  });
}

/**
 * ❌ The bug. `write()` returns `false` once the writable's internal buffer is
 * past its highWaterMark — and this loop ignores it. The source is never
 * paused, so every chunk it can produce piles up in memory.
 *
 * Note that it also *finishes the read* almost instantly. That is the trap: the
 * naïve version looks fast, because "done reading" is not "done writing".
 */
async function naive(): Promise<void> {
  const source = fastSource(CHUNKS, CHUNK_SIZE);
  const sink = slowSink();

  source.on("data", (chunk: Buffer) => {
    sink.write(chunk); // return value dropped on the floor
  });

  await new Promise<void>((resolve) => source.once("end", resolve));
  sink.end();
  await new Promise<void>((resolve) => sink.once("finish", resolve));
}

/**
 * ✅ Option A — `pipeline()`. It wires the back-pressure for you: the readable
 * is paused whenever the writable says it is full, and resumed on `drain`. It
 * also propagates errors and destroys every stream in the chain. This is the
 * answer; option B exists only to show what `pipeline` does on your behalf.
 */
async function withPipeline(): Promise<void> {
  await pipeline(fastSource(CHUNKS, CHUNK_SIZE), slowSink());
}

/**
 * ✅ Option B — the same thing by hand: honour `write()`'s return value and wait
 * for `drain` before writing again. `for await` over the readable gives us the
 * pausing half for free.
 */
async function withManualDrain(): Promise<void> {
  const source = fastSource(CHUNKS, CHUNK_SIZE);
  const sink = slowSink();

  for await (const chunk of source) {
    if (!sink.write(chunk as Buffer)) {
      // The buffer is full: stop pulling from the source until it empties.
      await new Promise<void>((resolve) => sink.once("drain", resolve));
    }
  }

  sink.end();
  await new Promise<void>((resolve) => sink.once("finish", resolve));
}

const VARIANTS = {
  naive: { label: "❌ naive", run: naive },
  pipeline: { label: "✅ pipeline", run: withPipeline },
  manual: { label: "✅ manual drain", run: withManualDrain },
} as const;

type VariantName = keyof typeof VARIANTS;

/** Child mode: run one variant and report its peak RSS on stdout as JSON. */
async function runVariant(name: VariantName): Promise<void> {
  let peak = 0;
  const sampler = setInterval(() => {
    peak = Math.max(peak, process.memoryUsage().rss);
  }, 10);
  sampler.unref();

  const started = performance.now();
  await VARIANTS[name].run();
  clearInterval(sampler);

  peak = Math.max(peak, process.memoryUsage().rss);
  console.log(JSON.stringify({ peakMb: peak / 1024 ** 2, ms: performance.now() - started }));
}

/** Parent mode: fork one child per variant and print the comparison. */
async function runAll(): Promise<void> {
  const self = fileURLToPath(import.meta.url);
  console.log(`writing ${CHUNKS} x ${CHUNK_SIZE / 1024} KB through a ${SINK_DELAY_MS} ms/chunk sink\n`);

  for (const [name, { label }] of Object.entries(VARIANTS)) {
    const result = await new Promise<{ peakMb: number; ms: number }>((resolve, reject) => {
      const child = fork(self, [name], { stdio: ["ignore", "pipe", "inherit", "ipc"] });
      let out = "";
      child.stdout?.on("data", (data: Buffer) => (out += data.toString()));
      child.once("error", reject);
      child.once("exit", (code) =>
        code === 0
          ? resolve(JSON.parse(out) as { peakMb: number; ms: number })
          : reject(new Error(`${name} exited with ${code}`)),
      );
    });

    console.log(
      `${label.padEnd(18)} peak RSS ${result.peakMb.toFixed(0).padStart(4)} MB` +
        `   ${Math.round(result.ms).toString().padStart(6)} ms`,
    );
  }

  console.log(
    "\nThe naïve run holds the whole source in memory at once; the two fixed" +
      "\nversions stay flat at roughly the sink's highWaterMark — and buy nothing" +
      "\nin wall clock for it, because the wall clock was always the sink's." +
      "\nRaise CHUNKS and only the first one meets the OOM killer.",
  );
}

const arg = process.argv[2];
if (arg && arg in VARIANTS) {
  await runVariant(arg as VariantName);
} else {
  await runAll();
}
