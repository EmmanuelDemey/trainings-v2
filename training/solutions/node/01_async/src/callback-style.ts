import { readFile } from "node:fs";

/**
 * Provided WORKING callback-based implementation.
 *
 * Reads a JSON file and parses it, the "old" Node.js way: nested callbacks and
 * manual error forwarding. This is your reference behaviour for Task 1 — do not
 * modify it; rewrite an equivalent with async/await in src/index.ts.
 */
export function readConfig(
  path: string,
  callback: (error: Error | null, config?: unknown) => void,
): void {
  readFile(path, "utf8", (error, raw) => {
    if (error) {
      callback(error);
      return;
    }

    try {
      const config: unknown = JSON.parse(raw);
      callback(null, config);
    } catch (parseError) {
      callback(parseError as Error);
    }
  });
}
