import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEY_LEN = 64;
const SALT_LEN = 16;

interface StoredHash {
  salt: Buffer;
  key: Buffer;
}

/** Derives a key from `password` using a fresh random salt. */
async function hashPassword(password: string): Promise<StoredHash> {
  // TODO: generate a random salt with randomBytes(SALT_LEN).
  // TODO: derive a key with scryptAsync(password, salt, KEY_LEN) (it returns a Buffer).
  // TODO: return { salt, key }.
  throw new Error('TODO: implement hashPassword');
}

/** Verifies `candidate` against a previously stored hash, in constant time. */
async function verifyPassword(
  candidate: string,
  stored: StoredHash,
): Promise<boolean> {
  // TODO: derive a key from `candidate` using the stored salt.
  // TODO: compare it with stored.key using timingSafeEqual.
  // TODO: guard against length mismatches before calling timingSafeEqual.
  throw new Error('TODO: implement verifyPassword');
}

async function main(): Promise<void> {
  const stored = await hashPassword('s3cret');
  console.log('right password ->', await verifyPassword('s3cret', stored));
  console.log('wrong password ->', await verifyPassword('nope', stored));
}

await main();
