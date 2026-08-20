import express from 'express';
import type { Request, Response } from 'express';
import { scryptSync, randomBytes } from 'node:crypto';
import { hashInWorker } from './run-worker.ts';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

/**
 * CPU-bound password hashing using node:crypto scrypt.
 *
 * NOTE: the slides use bcrypt; we use scrypt to keep this TP free of native
 * dependencies. scrypt is just as CPU-intensive, which is exactly what we want
 * to demonstrate blocking the event loop.
 *
 * This is the INLINE BLOCKING version — it runs scrypt on the main thread and
 * stalls the event loop for the duration of the computation. Kept so step 3 can
 * benchmark the two against each other.
 */
function hashInline(password: string): string {
  const salt = randomBytes(16);
  // High cost so the blocking is clearly visible under load.
  const derived = scryptSync(password, salt, 64, {
    N: 2 ** 15,
    // scrypt needs 128 * N * r bytes (~34 MB here) and Node's default
    // `maxmem` is 32 MB — without this it throws `RangeError: Invalid
    // scrypt params` before doing any work at all.
    maxmem: 64 * 1024 * 1024,
  });
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

/** Step 2 — the hashing runs on a Worker Thread; this loop stays free. */
app.get('/hash', async (req: Request, res: Response) => {
  const password = String(req.query.password ?? '');
  if (!password) {
    res.status(400).json({ error: 'missing ?password' });
    return;
  }

  const hash = await hashInWorker(password);
  res.json({ hash, pid: process.pid });
});

/** The blocking version, for the step-3 comparison. */
app.get('/hash-inline', (req: Request, res: Response) => {
  const password = String(req.query.password ?? '');
  if (!password) {
    res.status(400).json({ error: 'missing ?password' });
    return;
  }

  res.json({ hash: hashInline(password), pid: process.pid });
});

/** Cheap route: hit it while /hash-inline is under load and watch it stall. */
app.get('/healthy', (_req: Request, res: Response) => {
  res.json({ status: 'ok', pid: process.pid });
});

app.listen(PORT, () => {
  console.log(`[pid ${process.pid}] listening on http://localhost:${PORT}`);
});
