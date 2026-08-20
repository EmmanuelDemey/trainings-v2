// STEP 1 — Stream-read the CSV and count rows matching a criterion.
//
// Constraint: the file may be several GB. Never buffer it whole. Read it chunk
// by chunk, split on newlines, and keep a leftover fragment between chunks.
//
// The leftover is the whole exercise. A 64 KB chunk boundary lands in the middle
// of a line roughly always, so `chunk.split("\n")` hands you a truncated last
// element every single time. Drop it and you silently lose ~1 row per chunk —
// a bug that never throws and only shows up as a wrong total.

import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";

const CSV = new URL("../data/sample.csv", import.meta.url);

/** Returns true if the row should be counted (amount above the threshold). */
function matches(line: string, threshold: number): boolean {
  const [id, , amount] = line.split(",");

  // Skip the header row: its first column is the literal "id".
  if (id === "id") return false;

  const value = Number(amount);
  return Number.isFinite(value) && value > threshold;
}

export async function countMatchingLines(threshold = 500): Promise<number> {
  let count = 0;
  let leftover = "";

  // `encoding: "utf8"` makes the stream yield strings instead of Buffers. It is
  // safe here because Node decodes with a StringDecoder that never splits a
  // multi-byte character across two chunks.
  const stream = createReadStream(CSV, { encoding: "utf8" });

  for await (const chunk of stream) {
    const lines = (leftover + chunk).split("\n");

    // The last element is either an incomplete line or "" — either way it is
    // not ours to parse yet.
    leftover = lines.pop() ?? "";

    for (const line of lines) {
      if (matches(line, threshold)) count++;
    }
  }

  // The final line if the file does not end with a newline.
  if (leftover !== "" && matches(leftover, threshold)) count++;

  return count;
}

// Allow running this file directly: `node src/count-lines.ts`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const n = await countMatchingLines();
  console.log(`Matching rows: ${n}`);
}
