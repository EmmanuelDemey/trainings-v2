// STEP 1 — Stream-read the CSV and count rows matching a criterion.
//
// Constraint: the file may be several GB. Never buffer it whole. Read it chunk
// by chunk, split on newlines, and keep a leftover fragment between chunks.

import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";

const CSV = new URL("../data/sample.csv", import.meta.url);

/** Returns true if the row should be counted (e.g. amount > threshold). */
function matches(_line: string): boolean {
  // TODO: parse the CSV line (id,category,amount) and return whether it matches
  //       your criterion. Skip the header row.
  return false;
}

export async function countMatchingLines(threshold = 500): Promise<number> {
  let count = 0;
  // TODO: open the file with `await using` over a file handle, or use
  //       createReadStream(CSV, { encoding: "utf8" }) and iterate it with
  //       `for await (const chunk of stream)`.
  // TODO: maintain a `leftover` string for partial lines that span two chunks.
  // TODO: for each complete line, call matches(line) and increment count.
  void threshold;
  void createReadStream;
  void matches;
  return count;
}

// Allow running this file directly: `node src/count-lines.ts`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const n = await countMatchingLines();
  console.log(`Matching rows: ${n}`);
}
