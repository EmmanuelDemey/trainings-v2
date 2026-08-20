// Entry point — wire the three steps together.
//
// Run with `npm start`. Make sure you ran `npm run generate` first so that
// data/sample.csv exists.

import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { countMatchingLines } from "./count-lines.ts";
import { encryptAndCompress } from "./encrypt-pipeline.ts";
import { JsonLinesParser } from "./jsonl-transform.ts";

async function main(): Promise<void> {
  // Step 1 — count matching rows.
  const threshold = 500;
  const before = process.memoryUsage().heapUsed;
  const matching = await countMatchingLines(threshold);
  const used = (process.memoryUsage().heapUsed - before) / 1024 ** 2;
  console.log(`Step 1 — ${matching} rows with amount > ${threshold}`);
  // The number that matters: it stays flat whether the CSV is 10 MB or 10 GB.
  console.log(`         heap grew by ${used.toFixed(1)} MB while reading the file`);

  // Step 2 — compress + encrypt.
  await encryptAndCompress();
  console.log(
    `Step 2 — wrote ${fileURLToPath(new URL("../data/sample.csv.gz.enc", import.meta.url))}`,
  );

  // Step 3 — exercise the JSON Lines transform. The chunk boundaries below are
  // deliberately mid-line, which is exactly what a real socket does.
  const source = Readable.from([
    '{"id":1,"level":"info","msg":"boot"}\n{"id":2,"lev',
    'el":"warn","msg":"slow query"}\n\n{"id":3,"level":"error","msg":"boom"}',
  ]);

  console.log("Step 3 — parsed JSON Lines:");
  for await (const entry of source.pipe(new JsonLinesParser())) {
    console.log("        ", entry);
  }
}

await main();
