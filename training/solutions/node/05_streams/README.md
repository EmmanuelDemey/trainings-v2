# TP 5 — Node.js streams

> This TP is **autonomous**: it depends on no other TP. You can complete it in
> isolation. Everything you need lives in this directory.

## Goal

Apply the concepts from chapter 5 (streams) to process large data sets with a
constant, bounded memory footprint. You will read a multi-GB-scale CSV without
loading it into memory, chain transformations (compression + encryption) through
a pipeline, and write your own `Transform` stream.

## Prerequisites

- **Node.js >= 24** (TypeScript runs natively, no build step).
- No runtime dependencies. Only Node.js built-ins are used
  (`node:fs`, `node:zlib`, `node:crypto`, `node:stream`).

Check your version:

```bash
node --version   # must be >= 24
```

(An `.nvmrc` is provided: `nvm use`.)

## Setup

```bash
npm install                # dev dependencies only (typescript, @types/node)
npm run generate           # creates data/sample.csv (~200k rows)
npm start                  # runs src/index.ts (your wiring)
```

`npm run generate` is provided and working — it streams a sample CSV into
`data/sample.csv`. The `data/` directory is tracked via `.gitkeep`; generated
files inside it are yours to (re)create freely.

Type-check at any time without running:

```bash
npm run typecheck
```

## Steps

1. **Count lines matching a criterion** — in `src/count-lines.ts`, stream-read
   `data/sample.csv` and count the rows that match a criterion (e.g. an `amount`
   column above a threshold). Never read the whole file into memory: consume it
   chunk by chunk and split on newlines. Imagine the file is several GB.

2. **Compress + encrypt pipeline** — in `src/encrypt-pipeline.ts`, build a
   `pipeline()` that reads the CSV, gzips it (`zlib.createGzip`), encrypts the
   result with AES-256 (`crypto.createCipheriv`), and writes the output file.
   Let `pipeline()` handle error propagation and cleanup for you.

3. **Custom Transform for JSON Lines** — in `src/jsonl-transform.ts`, implement
   an object-mode `Transform` that parses [JSON Lines](https://jsonlines.org/):
   each input line is a JSON object; emit the parsed objects downstream. Wire it
   from `src/index.ts`.

## Going further

- **Back-pressure**: observe what happens when the writable side is slower than
  the readable side. The stream machinery pauses the source automatically — do
  not defeat it by buffering everything yourself. Experiment with
  `highWaterMark`.
- **`pipeline`**: prefer `stream/promises`' `pipeline()` over manual `.pipe()`
  chains — it propagates errors and destroys every stream in the chain on
  failure, avoiding leaks. Try injecting an error mid-chain and watch the
  cleanup.
