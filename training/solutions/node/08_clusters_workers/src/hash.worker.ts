import { parentPort, workerData } from 'node:worker_threads';
import { scryptSync, randomBytes } from 'node:crypto';

/**
 * Worker Thread entry point.
 *
 * The password to hash is passed via `workerData` when the worker is spawned.
 * Everything below runs on its OWN thread, with its own event loop and its own
 * V8 isolate — which is why `scryptSync` blocking here is harmless: the HTTP
 * server's loop never notices.
 */

interface HashWorkerData {
  password: string;
}

const { password } = workerData as HashWorkerData;

const salt = randomBytes(16);
// N = 2**15 is the cost factor: deliberately expensive, that is the point of a
// password KDF. Same parameters as the inline version so the two are comparable.
const derived = scryptSync(password, salt, 64, {
    N: 2 ** 15,
    // scrypt needs 128 * N * r bytes (~34 MB here) and Node's default
    // `maxmem` is 32 MB — without this it throws `RangeError: Invalid
    // scrypt params` before doing any work at all.
    maxmem: 64 * 1024 * 1024,
  });

// `postMessage` structured-clones its argument back to the parent. A string is
// the cheapest thing to send; a 64-byte Buffer would be copied too, and for
// anything large you would reach for a transferable ArrayBuffer instead.
parentPort?.postMessage(`${salt.toString('hex')}:${derived.toString('hex')}`);
