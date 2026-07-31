import { parentPort, workerData } from 'node:worker_threads';
import { scryptSync, randomBytes } from 'node:crypto';

/**
 * Worker Thread entry point.
 *
 * The password to hash is passed via `workerData` when the worker is spawned.
 * Compute the scrypt hash here — this runs OFF the main thread, so it no longer
 * blocks the HTTP server's event loop.
 */

interface HashWorkerData {
  password: string;
}

const { password } = workerData as HashWorkerData;

// TODO (step 2): compute the scrypt hash of `password` and send it back.
//   1. Generate a random salt with randomBytes(16).
//   2. Derive the key with scryptSync(password, salt, 64, { N: 2 ** 15 }).
//   3. Post the result back to the parent with:
//        parentPort?.postMessage(`${salt}:${derived}`);
//
// Hint: keep the same `${salt.toString('hex')}:${derived.toString('hex')}`
// format as the inline version so the two are comparable.

void password;
void parentPort;
void scryptSync;
void randomBytes;
