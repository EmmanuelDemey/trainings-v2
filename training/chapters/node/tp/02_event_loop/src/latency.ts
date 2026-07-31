// Step 2 — Measure event-loop latency under load.
//
// `monitorEventLoopDelay` records how long the loop is delayed beyond its expected
// tick interval. Under a healthy loop the delay is near zero; under CPU load it grows.

import { monitorEventLoopDelay } from "node:perf_hooks";
import type { IntervalHistogram } from "node:perf_hooks";

// Histograms report in nanoseconds — convert to milliseconds for readability.
const NS_PER_MS = 1_000_000;

export function run(): void {
  // TODO: create the histogram with monitorEventLoopDelay({ resolution: 20 })
  // TODO: call histogram.enable() to start sampling
  const histogram: IntervalHistogram = monitorEventLoopDelay();

  // TODO: every second, log histogram.mean and histogram.percentile(99)
  //       (divide by NS_PER_MS), then histogram.reset() for the next window.
  setInterval(() => {
    // TODO: replace with real readings
    console.log("mean=? ms  p99=? ms");
  }, 1000);

  simulateLoad();
}

// TODO: periodically block the loop so the histogram above shows a spike.
// Use setInterval with a synchronous busy-wait (e.g. a while loop spinning until
// Date.now() advances by ~100ms) to simulate a CPU-bound task on the main thread.
function simulateLoad(): void {
  // TODO: implement the periodic blocking work
}

if (import.meta.main) {
  run();
}
