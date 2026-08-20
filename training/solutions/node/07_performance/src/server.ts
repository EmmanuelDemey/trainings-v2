import express from 'express';
import type { Request, Response } from 'express';
import { computeHeavy, sliceWithSetImmediate } from './heavy.ts';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// ---------------------------------------------------------------------------
// /slow — the heavy computation, sliced (task 3).
//
// `await sliceWithSetImmediate(...)` yields to the event loop between chunks,
// so `/healthy` keeps answering while this runs. Compare for yourself: hit
// `/slow-blocking` below with `npm run load` and `curl /healthy` in parallel,
// then do the same against `/slow`.
// ---------------------------------------------------------------------------
app.get('/slow', async (_req: Request, res: Response) => {
  const result = await sliceWithSetImmediate(50_000_000);
  res.json({ result });
});

// The original blocking version, kept so the two can be measured side by side.
app.get('/slow-blocking', (_req: Request, res: Response) => {
  const result = computeHeavy(50_000_000);
  res.json({ result });
});

// ---------------------------------------------------------------------------
// /leak — the leak is fixed (task 2).
//
// The diagnosis: `leakedData` was a MODULE-level array, so every request added
// 1 MB that nothing ever removed. In the heap snapshot comparison the retainer
// chain ended at the module scope — that is the tell. A leak is almost never
// "allocating too much", it is "allocating into something that outlives the
// request".
//
// The fix is to scope the buffer to the request: it becomes garbage the moment
// the handler returns.
// ---------------------------------------------------------------------------
app.get('/leak', (_req: Request, res: Response) => {
  const scratch = Buffer.alloc(1_000_000); // collected after this handler
  res.json({ allocatedMb: scratch.length / 1_000_000, heapMb: heapUsedMb() });
});

/**
 * The leaky route, kept behind an explicit name so step 2 can still be
 * reproduced: take three heap snapshots while hammering it and watch the
 * retained `Buffer`s pile up under this array.
 */
const leakedData: Buffer[] = [];

app.get('/leak-on-purpose', (_req: Request, res: Response) => {
  leakedData.push(Buffer.alloc(1_000_000)); // 1 MB retained per call
  res.json({ retainedMb: leakedData.length, heapMb: heapUsedMb() });
});

// ---------------------------------------------------------------------------
// /healthy — cheap reference route. Use it to check responsiveness while
// /slow is under load: if it hangs too, the event loop is blocked.
// ---------------------------------------------------------------------------
app.get('/healthy', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime(), heapMb: heapUsedMb() });
});

function heapUsedMb(): number {
  return Math.round(process.memoryUsage().heapUsed / 1024 ** 2);
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
