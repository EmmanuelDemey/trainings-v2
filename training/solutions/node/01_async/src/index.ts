import { readFile } from "node:fs/promises";
import { readConfig } from "./callback-style.ts";
import { fetchWithTimeout } from "./http.ts";

// A few public, no-auth endpoints you can use for the HTTP tasks.
const ENDPOINTS = [
  "https://httpbin.org/get",
  "https://httpbin.org/uuid",
  "https://httpbin.org/user-agent",
] as const;

/**
 * Task 1 — the callback version, rewritten with async/await.
 *
 * Same behaviour as `readConfig`, minus the manual error forwarding: a rejected
 * `readFile` and a `JSON.parse` throw both propagate to the caller's `await`.
 */
async function readConfigAsync(path: string): Promise<unknown> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw);
}

/** The callback version, promisified, so Task 1 can compare the two. */
function readConfigPromisified(path: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    readConfig(path, (error, config) => (error ? reject(error) : resolve(config)));
  });
}

/**
 * Task 2 — three independent HTTP calls, awaited together.
 *
 * The requests are started by the `.map()`; `Promise.all` only waits. Awaiting
 * inside the loop instead would serialise them and cost the sum of the
 * latencies rather than the slowest one.
 */
async function fetchAllInParallel(): Promise<unknown[]> {
  const responses = await Promise.all(ENDPOINTS.map((url) => fetch(url)));
  return Promise.all(responses.map((response) => response.json()));
}

/** Task 2, variant: report the failures instead of losing every result to one. */
async function fetchAllSettled(): Promise<void> {
  const results = await Promise.allSettled(ENDPOINTS.map((url) => fetch(url)));
  results.forEach((result, index) => {
    const url = ENDPOINTS[index];
    if (result.status === "fulfilled") {
      console.log(`  ok      ${url} -> ${result.value.status}`);
    } else {
      console.log(`  failed  ${url} -> ${String(result.reason)}`);
    }
  });
}

/**
 * Task 3 — the same call, once with an impossible deadline and once with a
 * generous one.
 */
async function fetchWithTimeoutDemo(): Promise<void> {
  for (const ms of [1, 20_000]) {
    // httpbin.org is often slow: a "generous" deadline has to be generous.
    try {
      const response = await fetchWithTimeout(ENDPOINTS[0], ms);
      console.log(`  ${ms} ms -> ${response.status}`);
    } catch (error) {
      // An aborted fetch rejects with a DOMException named "AbortError" (or
      // "TimeoutError" when the signal came from AbortSignal.timeout).
      const name = error instanceof Error ? error.name : "unknown";
      console.log(`  ${ms} ms -> aborted (${name})`);
    }
  }
}

async function main(): Promise<void> {
  console.log("Task 1 — callback vs. async/await");
  const [fromCallback, fromAsync] = await Promise.all([
    readConfigPromisified("package.json"),
    readConfigAsync("package.json"),
  ]);
  console.log(`  same result: ${JSON.stringify(fromCallback) === JSON.stringify(fromAsync)}`);

  console.log("Task 2 — Promise.all");
  const started = performance.now();
  const payloads = await fetchAllInParallel();
  console.log(`  ${payloads.length} responses in ${Math.round(performance.now() - started)} ms`);
  await fetchAllSettled();

  console.log("Task 3 — AbortController");
  await fetchWithTimeoutDemo();
}

await main();
