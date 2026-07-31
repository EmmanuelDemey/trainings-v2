import express from 'express';
import type { Request, Response } from 'express';
import { computeHeavy } from './heavy.ts';

const app = express();
const PORT = 3000;

// ---------------------------------------------------------------------------
// /slow — blocks the event loop with a heavy synchronous computation.
//
// Every request runs `computeHeavy` to completion before returning. While it
// runs, NO other request can be served. Profile it with `npm run clinic` and
// hammer it with `npm run load`.
//
// TODO (task 3): make this route non-blocking by computing the result with
// `sliceWithSetImmediate` (to implement in src/heavy.ts) and `await`-ing it,
// so the event loop stays responsive under load.
// ---------------------------------------------------------------------------
app.get('/slow', (_req: Request, res: Response) => {
  const result = computeHeavy(50_000_000);
  res.json({ result });
});

// ---------------------------------------------------------------------------
// /leak — intentional memory leak.
//
// Each call pushes a chunk into a module-level array that is never released,
// so process memory grows forever. Detect it by taking 3 heap snapshots in
// Chrome DevTools (see README) and comparing retained allocations.
//
// TODO (task 2): once you have located the leak, fix it. The buffer must not
// grow unbounded across requests (e.g. scope it to the request, or drop it).
// ---------------------------------------------------------------------------
const leakedData: Buffer[] = [];

app.get('/leak', (_req: Request, res: Response) => {
  leakedData.push(Buffer.alloc(1_000_000)); // 1 MB retained per call
  res.json({ retainedMb: leakedData.length });
});

// ---------------------------------------------------------------------------
// /healthy — cheap reference route. Use it to check responsiveness while
// /slow is under load: if it hangs too, the event loop is blocked.
// ---------------------------------------------------------------------------
app.get('/healthy', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
