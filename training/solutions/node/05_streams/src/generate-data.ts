// PROVIDED — working sample-data generator. No TODO here: run it as-is.
//
// Streams ~200k CSV rows into ./data/sample.csv. We use a Readable in pull mode
// (push from `read()`) piped into a write stream so memory stays bounded no
// matter how many rows we generate — increase ROWS to simulate a multi-GB file.

import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const ROWS = 200_000;
const CATEGORIES = ["books", "games", "music", "food", "travel"] as const;
const dataDir = fileURLToPath(new URL("../data/", import.meta.url));
const outFile = new URL("sample.csv", new URL("../data/", import.meta.url));

function rowsReadable(total: number): Readable {
  let i = 0;
  return new Readable({
    read() {
      // Emit a bounded batch per call; honour back-pressure via the return value.
      let keepGoing = true;
      while (keepGoing && i < total) {
        if (i === 0) keepGoing = this.push("id,category,amount\n");
        else {
          const category = CATEGORIES[i % CATEGORIES.length];
          const amount = (Math.random() * 1000).toFixed(2);
          keepGoing = this.push(`${i},${category},${amount}\n`);
        }
        i++;
      }
      if (i >= total) this.push(null);
    },
  });
}

await mkdir(dataDir, { recursive: true });
await pipeline(rowsReadable(ROWS), createWriteStream(outFile));
console.log(`Wrote ${ROWS} rows to ${fileURLToPath(outFile)}`);
