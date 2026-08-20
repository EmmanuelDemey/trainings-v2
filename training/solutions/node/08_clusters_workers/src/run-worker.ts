import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';

/**
 * Spawn the hashing worker, hand it the password, and resolve with the hash.
 *
 * One worker is created per call here for simplicity. That is NOT free: a
 * thread costs a few milliseconds and its own V8 isolate (~a few MB), so under
 * real load you pool them — see "Going further" in the README.
 */
export function hashInWorker(password: string): Promise<string> {
  // Resolve the worker file relative to this module (works under `node x.ts`).
  const workerUrl = new URL('./hash.worker.ts', import.meta.url);

  return new Promise<string>((resolve, reject) => {
    const worker = new Worker(fileURLToPath(workerUrl), { workerData: { password } });

    worker.once('message', (hash: string) => {
      resolve(hash);
    });

    worker.once('error', reject);

    // The three listeners are all required. Without 'exit', a worker that dies
    // before posting anything (an OOM, a `process.exit` in the worker) leaves
    // this promise pending for ever — and with it, the HTTP request.
    worker.once('exit', (code) => {
      if (code !== 0) reject(new Error(`hash worker stopped with exit code ${code}`));
    });
  });
}
