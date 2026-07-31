import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

/**
 * Spawn the hashing worker, hand it the password, and resolve with the hash.
 *
 * One worker is created per call here for simplicity. See "Going further" in the
 * README for turning this into a reusable worker pool.
 */
export function hashInWorker(password: string): Promise<string> {
  // Resolve the worker file relative to this module (works under `node x.ts`).
  const workerUrl = new URL('./hash.worker.ts', import.meta.url);

  // TODO (step 2): create the Worker, pass `password` via workerData, and wrap
  // its lifecycle in a Promise:
  //   - new Worker(fileURLToPath(workerUrl), { workerData: { password } })
  //   - resolve on the 'message' event (the computed hash)
  //   - reject on the 'error' event
  //   - reject on 'exit' when the exit code is non-zero
  //
  // Return that Promise instead of the rejection below.
  void Worker;
  void fileURLToPath;
  void workerUrl;
  return Promise.reject(new Error('hashInWorker not implemented yet'));
}
