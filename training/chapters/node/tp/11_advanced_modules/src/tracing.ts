import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

interface RequestContext {
  requestId: string;
}

// TODO: create an AsyncLocalStorage using the Node 24 options form:
//   new AsyncLocalStorage<RequestContext>({ name, defaultValue })
// Pick a name (e.g. 'request-context') and a sensible defaultValue.
const storage = new AsyncLocalStorage<RequestContext>(/* TODO */);

/** Logs a message, automatically prefixed with the current request id. */
function log(message: string): void {
  // TODO: read the current store from `storage` and prefix the log line with
  // its requestId (fall back to '-' when there is no active context).
}

async function loadUser(): Promise<string> {
  await new Promise((r) => setTimeout(r, 10));
  // TODO: log "loading user" — it should carry the request id automatically.
  return 'alice';
}

async function handleRequest(): Promise<void> {
  // TODO: log the start of the request, call loadUser(), then log the result.
}

async function main(): Promise<void> {
  // TODO: run handleRequest() inside storage.run({ requestId: randomUUID() }, ...)
  // a couple of times to show that each request keeps its own id end-to-end.
}

await main();
