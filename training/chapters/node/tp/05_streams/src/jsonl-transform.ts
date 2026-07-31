// STEP 3 — A custom object-mode Transform that parses JSON Lines.
//
// Input: a byte/string stream where each line is one JSON object.
// Output (object mode): the parsed JavaScript objects, one per line.

import { Transform } from "node:stream";
import type { TransformCallback } from "node:stream";

export class JsonLinesParser extends Transform {
  // Buffer for a partial line that spans two chunks.
  #leftover = "";

  constructor() {
    // TODO: call super(...) with readableObjectMode: true so downstream
    //       consumers receive parsed objects rather than buffers.
    super();
  }

  override _transform(
    _chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    // TODO:
    //  1. Append chunk (as string) to this.#leftover.
    //  2. Split on "\n"; keep the last (possibly incomplete) segment as leftover.
    //  3. For each complete, non-empty line: this.push(JSON.parse(line)).
    //  4. Call callback() (or callback(err) on a parse error).
    void this.#leftover;
    callback();
  }

  override _flush(callback: TransformCallback): void {
    // TODO: parse and push any final buffered line, then call callback().
    callback();
  }
}
