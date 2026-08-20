// Step 1 — Predict, then verify, the order the event loop runs these callbacks.
//
// Before running this file, write down the order you EXPECT the lines to print.
// Then run `node src/order.ts` and compare with reality:
//
//   1: sync start          <- synchronous code runs first, to completion
//   2: sync end
//   promise                <- !! not the order the textbooks give you
//   nextTick
//   setTimeout(0)          <- timers phase   } order varies between runs,
//   setImmediate           <- check phase    } see point 2 below
//
// Two surprises, and both are worth the detour.
//
// 1. `promise` before `nextTick`.
//    The rule "the nextTick queue drains before the promise queue" is true —
//    but only *between* two microtask checkpoints. This file is an ES module,
//    and evaluating an ES module is itself a promise job: when the module body
//    ends we are already inside the microtask checkpoint, so the promise queue
//    finishes draining before Node returns to the nextTick queue. Move the same
//    four lines into a `setTimeout` (see `runInsideTimer` below) or into a
//    CommonJS file and you get `nextTick` first, as advertised.
//
// 2. `setImmediate` before `setTimeout(0)`.
//    From the main module this order is NOT guaranteed: `setTimeout(fn, 0)` is
//    clamped to 1 ms, so it depends on whether the loop reaches its first timers
//    phase before that millisecond has elapsed. Run the file a few times — on a
//    loaded machine the two can swap. From inside an I/O callback the order IS
//    guaranteed (`runInsideIo` below): the check phase comes right after poll.

export function run(): void {
  console.log("1: sync start");

  // Microtasks: two separate queues, nextTick's is the higher-priority one.
  process.nextTick(() => console.log("nextTick"));
  Promise.resolve().then(() => console.log("promise"));

  // Macrotasks: check phase vs. timers phase.
  setImmediate(() => console.log("setImmediate"));
  setTimeout(() => console.log("setTimeout(0)"), 0);

  console.log("2: sync end");
}

/** The same four callbacks, scheduled from a macrotask: nextTick wins again. */
export function runInsideTimer(): void {
  setTimeout(() => {
    process.nextTick(() => console.log("timer > nextTick"));
    Promise.resolve().then(() => console.log("timer > promise"));
  }, 0);
}

/** Inside an I/O callback, `setImmediate` beats `setTimeout(0)` — every time. */
export function runInsideIo(): void {
  import("node:fs").then(({ readFile }) => {
    readFile(import.meta.filename, () => {
      setTimeout(() => console.log("io > setTimeout(0)"), 0);
      setImmediate(() => console.log("io > setImmediate"));
    });
  });
}

// Allow running this file directly: `node src/order.ts`
if (import.meta.main) {
  run();
  runInsideTimer();
  runInsideIo();
}
