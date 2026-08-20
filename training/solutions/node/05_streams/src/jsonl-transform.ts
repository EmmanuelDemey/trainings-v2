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
    // Only the READABLE side is in object mode: what comes in is still bytes,
    // what goes out is parsed objects. `objectMode: true` would set both and
    // break the `highWaterMark` accounting on the writable side.
    super({ readableObjectMode: true });
  }

  override _transform(
    chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    this.#leftover += chunk.toString();

    const lines = this.#leftover.split("\n");
    this.#leftover = lines.pop() ?? ""; // incomplete tail, kept for next chunk

    try {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "") continue; // blank lines are legal in JSON Lines
        this.push(JSON.parse(trimmed));
      }
      callback();
    } catch (error) {
      // Passing the error to the callback destroys the stream and surfaces it on
      // the consumer's `for await` / `pipeline()` promise. Throwing here instead
      // would become an uncaught exception.
      callback(error as Error);
    }
  }

  override _flush(callback: TransformCallback): void {
    // The last line when the source does not end with a newline.
    const trimmed = this.#leftover.trim();
    if (trimmed === "") {
      callback();
      return;
    }

    try {
      this.push(JSON.parse(trimmed));
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }
}
