import { readConfig } from "./callback-style.ts";
import { fetchWithTimeout } from "./http.ts";

// A few public, no-auth endpoints you can use for the HTTP tasks.
const ENDPOINTS = [
  "https://httpbin.org/get",
  "https://httpbin.org/uuid",
  "https://httpbin.org/user-agent",
] as const;

/**
 * Task 1 — Rewrite the callback-based `readConfig` using async/await.
 *
 * TODO:
 *  - Import `readFile` from "node:fs/promises".
 *  - Read the file as utf8, JSON.parse it, and return the result.
 *  - Keep the function `async` and let errors propagate naturally (try/catch
 *    only if you want to wrap them).
 *  - Compare its result with the provided callback version below to convince
 *    yourself they behave identically.
 */
async function readConfigAsync(path: string): Promise<unknown> {
  // TODO: implement with node:fs/promises + async/await.
  throw new Error(`Not implemented yet: readConfigAsync(${path})`);
}

/**
 * Task 2 — Parallelize three HTTP calls with Promise.all.
 *
 * TODO:
 *  - Use the global `fetch` (no import needed in Node.js 24).
 *  - Kick off all three requests in ENDPOINTS, then await them together with
 *    `Promise.all`. Do NOT await them one at a time.
 *  - Parse each Response as JSON and return the array of results.
 */
async function fetchAllInParallel(): Promise<unknown[]> {
  // TODO: implement with fetch + Promise.all.
  throw new Error("Not implemented yet: fetchAllInParallel()");
}

/**
 * Task 3 — Add an AbortController timeout around a fetch.
 *
 * TODO:
 *  - Implement `fetchWithTimeout` in src/http.ts first.
 *  - Call it here with a deliberately short delay (e.g. 1 ms) to observe the
 *    abort, then a generous delay to observe a success.
 */
async function fetchWithTimeoutDemo(): Promise<void> {
  // TODO: call fetchWithTimeout(...) and log the outcome (success vs. abort).
  void fetchWithTimeout;
  throw new Error("Not implemented yet: fetchWithTimeoutDemo()");
}

async function main(): Promise<void> {
  // Wire up the tasks here as you implement them. For example:
  //
  //   const fromCallback = await new Promise((resolve, reject) =>
  //     readConfig("package.json", (err, cfg) => (err ? reject(err) : resolve(cfg))),
  //   );
  //   const fromAsync = await readConfigAsync("package.json");
  //   console.log({ fromCallback, fromAsync });
  //
  //   console.log(await fetchAllInParallel());
  //   await fetchWithTimeoutDemo();

  void readConfig;
  void readConfigAsync;
  void fetchAllInParallel;
  void fetchWithTimeoutDemo;

  console.log("TP 1 starter — implement the TODOs, then call them from main().");
}

await main();
