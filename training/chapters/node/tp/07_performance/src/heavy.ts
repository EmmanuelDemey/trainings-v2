// Heavy CPU-bound computation used by the `/slow` route.
//
// `computeHeavy` runs entirely synchronously: while it loops, the event loop
// is fully blocked and the server cannot accept any other request. This is what
// you will observe with `clinic doctor` and `autocannon`.

export function computeHeavy(iterations: number): number {
  let acc = 0;
  for (let i = 0; i < iterations; i++) {
    // A bit of math so V8 cannot optimize the loop away.
    acc += Math.sqrt(i) * Math.sin(i);
  }
  return acc;
}

// TODO: implement `sliceWithSetImmediate`.
//
// Goal: produce the SAME result as `computeHeavy`, but split the work into
// chunks. Between two chunks, yield back to the event loop with `setImmediate`
// so other requests can be served. The function must be asynchronous.
//
// Suggested signature & approach:
//
//   export function sliceWithSetImmediate(
//     iterations: number,
//     chunkSize = 1_000_000,
//   ): Promise<number> {
//     return new Promise((resolve) => {
//       let acc = 0;
//       let i = 0;
//       function runChunk(): void {
//         const end = Math.min(i + chunkSize, iterations);
//         for (; i < end; i++) {
//           acc += Math.sqrt(i) * Math.sin(i);
//         }
//         if (i < iterations) setImmediate(runChunk); // yield, then continue
//         else resolve(acc);
//       }
//       runChunk();
//     });
//   }
