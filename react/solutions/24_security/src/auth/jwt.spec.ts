import { describe, expect, it } from 'vitest';
import { signToken } from '../mocks/tokens';
import { decodeJwt, isExpired } from './jwt';

const leia = { id: 'u2', name: 'Leia Organa', role: 'admin' as const };

describe('decodeJwt', () => {
  it('reads the claims of the payload', () => {
    const token = signToken(leia, { now: Date.UTC(2026, 0, 1), expiresIn: 300 });

    expect(decodeJwt(token)).toMatchObject({
      sub: 'u2',
      name: 'Leia Organa',
      role: 'admin',
      iat: Date.UTC(2026, 0, 1) / 1000,
      exp: Date.UTC(2026, 0, 1) / 1000 + 300,
    });
  });

  it('decodes base64url, not base64 — and UTF-8 inside', () => {
    // "Padmé" has an "é": UTF-8 bytes, and `-` / `_` in the encoded payload.
    const token = signToken({ id: 'u3', name: 'Padmé Amidala ???', role: 'user' });

    expect(decodeJwt(token).name).toBe('Padmé Amidala ???');
  });

  it('rejects a value that is not header.payload.signature', () => {
    expect(() => decodeJwt('not-a-token')).toThrow('Malformed token');
    expect(() => decodeJwt('a.%%%.c')).toThrow('Malformed token');
  });
});

describe('isExpired', () => {
  const now = Date.UTC(2026, 0, 1, 12, 0, 0);
  const inSeconds = (seconds: number) => ({ exp: now / 1000 + seconds });

  it('is false for a token valid for a while', () => {
    expect(isExpired(inSeconds(300), now)).toBe(false);
  });

  it('is true once `exp` — in SECONDS — is past', () => {
    expect(isExpired(inSeconds(-1), now)).toBe(true);
  });

  it('is true within the leeway: refresh a little before the end', () => {
    expect(isExpired(inSeconds(10), now, 30)).toBe(true);
    expect(isExpired(inSeconds(10), now, 0)).toBe(false);
  });
});
