// Entry point — wire the three steps together.
//
// Run with `npm start`. Make sure you ran `npm run generate` first so that
// data/sample.csv exists.

import { countMatchingLines } from "./count-lines.ts";
import { encryptAndCompress } from "./encrypt-pipeline.ts";
import { JsonLinesParser } from "./jsonl-transform.ts";

async function main(): Promise<void> {
  // Step 1 — count matching rows.
  // TODO: call countMatchingLines() and log the result.
  void countMatchingLines;

  // Step 2 — compress + encrypt.
  // TODO: call encryptAndCompress() and log where the output went.
  void encryptAndCompress;

  // Step 3 — exercise the JSON Lines transform.
  // TODO: feed a small JSON Lines source (e.g. Readable.from([...])) through a
  //       new JsonLinesParser() and log each parsed object.
  void JsonLinesParser;

  console.log("TODO: wire up the three steps above.");
}

await main();
