// Step 1 — Predict, then verify, the order the event loop runs these callbacks.
//
// Before running this file, write down the order you EXPECT the lines to print.
// Then run `node src/order.ts` and compare with reality.

export function run(): void {
  console.log("1: sync start");

  // TODO: schedule a microtask with process.nextTick(...) that logs "nextTick"
  // TODO: schedule a microtask with Promise.resolve().then(...) that logs "promise"
  // TODO: schedule a macrotask with setImmediate(...) that logs "setImmediate"
  // TODO: schedule a macrotask with setTimeout(..., 0) that logs "setTimeout(0)"

  console.log("2: sync end");
}

// Allow running this file directly: `node src/order.ts`
if (import.meta.main) {
  run();
}
