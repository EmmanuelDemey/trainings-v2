import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

// The async `scrypt` runs on the libuv thread pool, so it does NOT block the
// event loop — unlike `scryptSync`. For a KDF this matters: the whole point is
// that it takes a long time.
const scryptAsync = promisify(scrypt);

const KEY_LEN = 64;
const SALT_LEN = 16;

interface StoredHash {
  salt: Buffer;
  key: Buffer;
}

/** Derives a key from `password` using a fresh random salt. */
async function hashPassword(password: string): Promise<StoredHash> {
  // A NEW salt per password. Reusing one salt for the whole table means two
  // users with the same password get the same hash — and a single rainbow
  // table breaks all of them at once.
  const salt = randomBytes(SALT_LEN);
  const key = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return { salt, key };
}

/** Verifies `candidate` against a previously stored hash, in constant time. */
async function verifyPassword(candidate: string, stored: StoredHash): Promise<boolean> {
  const key = (await scryptAsync(candidate, stored.salt, KEY_LEN)) as Buffer;

  // `timingSafeEqual` THROWS on a length mismatch instead of returning false,
  // so the guard is required — and it is safe to leak, since the length here is
  // the fixed KEY_LEN, not anything derived from the password.
  if (key.length !== stored.key.length) return false;

  // `===` / `Buffer.equals` bail out at the first differing byte, so the time
  // they take reveals how many leading bytes an attacker got right. Over enough
  // samples, that is enough to recover the hash byte by byte.
  return timingSafeEqual(key, stored.key);
}

async function main(): Promise<void> {
  const started = performance.now();
  const stored = await hashPassword('s3cret');
  console.log(`hashed in ${Math.round(performance.now() - started)} ms (that slowness is the feature)`);
  console.log('salt:', stored.salt.toString('hex'));

  console.log('right password ->', await verifyPassword('s3cret', stored));
  console.log('wrong password ->', await verifyPassword('nope', stored));

  // Same password, different salt -> different key. This is the property that
  // makes a leaked password table useless as a rainbow table.
  const again = await hashPassword('s3cret');
  console.log('same password, new salt -> same key?', again.key.equals(stored.key));
}

await main();
