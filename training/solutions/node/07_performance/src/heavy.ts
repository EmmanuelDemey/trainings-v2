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

/**
 * The same computation, sliced so the event loop gets a turn between chunks.
 *
 * `setImmediate` schedules the next chunk in the CHECK phase, which means the
 * loop first drains its poll phase — i.e. it accepts sockets and runs pending
 * I/O callbacks. That is the whole trick: the total CPU time does not go down
 * (it goes slightly up), but the server stops being deaf while it computes.
 *
 * `chunkSize` is the knob. Too large and `/healthy` still stutters; too small
 * and the scheduling overhead dominates. 1e6 iterations lands around a few
 * milliseconds per chunk on a modern laptop — a good target, since it bounds
 * the worst-case latency you add to any other request.
 *
 * And the honest caveat: this keeps ONE process responsive while still burning
 * its only CPU. For real CPU-bound work, a Worker Thread (TP 8) is the answer;
 * slicing is what you reach for when the work is short and moving it off-thread
 * would cost more in serialisation than it saves.
 */
export function sliceWithSetImmediate(
  iterations: number,
  chunkSize = 1_000_000,
): Promise<number> {
  return new Promise((resolve) => {
    let acc = 0;
    let i = 0;

    function runChunk(): void {
      const end = Math.min(i + chunkSize, iterations);
      for (; i < end; i++) {
        acc += Math.sqrt(i) * Math.sin(i);
      }

      if (i < iterations) setImmediate(runChunk);
      else resolve(acc);
    }

    runChunk();
  });
}
