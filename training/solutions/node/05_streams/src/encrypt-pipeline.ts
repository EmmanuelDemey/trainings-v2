// STEP 2 — Compress + encrypt the CSV through a single pipeline.
//
// fs read -> gzip -> AES-256 cipher -> fs write, all chained with
// stream/promises' pipeline() so errors propagate and every stream is
// destroyed on failure.

import { createReadStream, createWriteStream } from "node:fs";
import { createCipheriv, randomBytes } from "node:crypto";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const INPUT = new URL("../data/sample.csv", import.meta.url);
const OUTPUT = new URL("../data/sample.csv.gz.enc", import.meta.url);

// AES-256-CBC needs a 32-byte key and a 16-byte IV. In real life, derive/store
// these securely; here we generate them so the TP is self-contained.
const key = randomBytes(32);
const iv = randomBytes(16);

export async function encryptAndCompress(): Promise<void> {
  // Gzip BEFORE encrypting, never the other way round: ciphertext is
  // indistinguishable from random noise and does not compress at all.
  //
  // `pipeline()` is what makes this four lines instead of forty. It wires the
  // `pipe` calls, forwards the first error to the returned promise, and
  // destroys every stream in the chain — including the write stream, so a
  // failure halfway through does not leave a dangling file descriptor. The
  // hand-rolled `.pipe().pipe()` chain does none of that.
  await pipeline(
    createReadStream(INPUT),
    createGzip(),
    createCipheriv("aes-256-cbc", key, iv),
    createWriteStream(OUTPUT),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await encryptAndCompress();
  console.log(`Wrote ${fileURLToPath(OUTPUT)}`);
}
