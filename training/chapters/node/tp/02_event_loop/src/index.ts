// Small menu to run each exercise from a single entry point.
//
//   node src/index.ts order      # Step 1 — callback ordering
//   node src/index.ts latency    # Step 2 — event-loop latency under load
//   node src/index.ts blocking   # Step 3 — CPU-bound workload (profile with --prof)

import { run as runOrder } from "./order.ts";
import { run as runLatency } from "./latency.ts";
import { run as runBlocking } from "./blocking.ts";

const exercises = {
  order: runOrder,
  latency: runLatency,
  blocking: runBlocking,
} as const;

type ExerciseName = keyof typeof exercises;

function main(): void {
  const name = process.argv[2] as ExerciseName | undefined;

  if (!name || !(name in exercises)) {
    console.log("Usage: node src/index.ts <exercise>");
    console.log(`Available: ${Object.keys(exercises).join(", ")}`);
    return;
  }

  exercises[name]();
}

main();
