// Step 2 — Measure event-loop latency under load.
//
// `monitorEventLoopDelay` records how long the loop is delayed beyond its expected
// tick interval. Under a healthy loop the delay is near zero; under CPU load it grows.

import { monitorEventLoopDelay } from "node:perf_hooks";
import type { IntervalHistogram } from "node:perf_hooks";

// Histograms report in nanoseconds — convert to milliseconds for readability.
const NS_PER_MS = 1_000_000;

// How long each simulated request blocks the main thread, and how often.
const BLOCK_MS = 100;
const BLOCK_EVERY_MS = 250;

export function run(): void {
  // `resolution` is the sampling interval: the histogram checks every 20 ms how
  // late the loop is. Finer resolution = more samples = slightly more overhead.
  const histogram: IntervalHistogram = monitorEventLoopDelay({ resolution: 20 });
  histogram.enable();

  setInterval(() => {
    const mean = histogram.mean / NS_PER_MS;
    const p99 = histogram.percentile(99) / NS_PER_MS;
    const max = histogram.max / NS_PER_MS;

    console.log(
      `mean=${mean.toFixed(1)} ms  p99=${p99.toFixed(1)} ms  max=${max.toFixed(1)} ms`,
    );

    // Reset so each line describes the last second, not the whole run —
    // otherwise one early spike keeps polluting the numbers for ever.
    histogram.reset();
  }, 1000).unref();

  simulateLoad();
}

/**
 * A CPU-bound "request" handled on the main thread: the loop cannot run a single
 * timer, I/O callback or incoming HTTP request while this spins.
 */
function simulateLoad(): void {
  setInterval(() => {
    const until = Date.now() + BLOCK_MS;
    while (Date.now() < until) {
      // Busy-wait on purpose. This is what a synchronous JSON.parse of a 50 MB
      // payload, a bcrypt round or a big template render looks like to the loop.
    }
  }, BLOCK_EVERY_MS);
}

if (import.meta.main) {
  run();
}
