import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

interface RequestContext {
  requestId: string;
}

/**
 * The Node 24 options form. Two things it buys you over `new AsyncLocalStorage()`:
 *  - `name` shows up in diagnostics (`--experimental-async-context-frame`,
 *    heap snapshots) — priceless when a process holds three of these;
 *  - `defaultValue` means `getStore()` never returns `undefined`, so the call
 *    sites below have no fallback branch to forget.
 */
const storage = new AsyncLocalStorage<RequestContext>({
  name: 'request-context',
  defaultValue: { requestId: '-' },
});

/** Logs a message, automatically prefixed with the current request id. */
function log(message: string): void {
  // No parameter, no `ctx` threaded through five call frames: the id is read
  // from the ambient context, whatever the depth.
  const { requestId } = storage.getStore() ?? { requestId: '-' };
  console.log(`[${requestId}] ${message}`);
}

async function loadUser(): Promise<string> {
  // The `await` is the interesting part: the context survives it. This is what
  // a plain module-level `let currentRequestId` cannot do — two concurrent
  // requests would overwrite each other's id at the first await.
  await new Promise((r) => setTimeout(r, 10));
  log('loading user');
  return 'alice';
}

async function handleRequest(): Promise<void> {
  log('request started');
  const user = await loadUser();
  log(`request done, user=${user}`);
}

async function main(): Promise<void> {
  log('outside any request context');

  // Two requests started concurrently and deliberately interleaved: each line
  // keeps its own id even though the two chains are running at the same time.
  await Promise.all([
    storage.run({ requestId: randomUUID().slice(0, 8) }, handleRequest),
    storage.run({ requestId: randomUUID().slice(0, 8) }, handleRequest),
  ]);
}

await main();
