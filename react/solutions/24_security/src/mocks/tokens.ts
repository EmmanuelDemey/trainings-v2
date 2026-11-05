import type { User } from '../model/user';

/** The lifetime of an access token: short, a refresh gives a new one. */
export const ACCESS_TOKEN_TTL_S = 5 * 60;

/** The fake API's "signature". A real one is an HMAC or an RSA signature. */
const SIGNATURE = 'mock-signature';

function base64UrlEncode(value: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** A JWT the fake API hands out: `header.payload.signature`, base64url-encoded. */
export function signToken(user: User, { expiresIn = ACCESS_TOKEN_TTL_S, now = Date.now() } = {}): string {
  const iat = Math.floor(now / 1000);
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
  const payload = base64UrlEncode({ sub: user.id, name: user.name, role: user.role, iat, exp: iat + expiresIn });
  return `${header}.${payload}.${SIGNATURE}`;
}

/** The SERVER side check: signature, then expiry. Never trust a token you did not verify. */
export function verifyToken(token: string): User | null {
  const [, payload, signature] = token.split('.');
  if (!payload || signature !== SIGNATURE) return null;
  const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  const claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(json, (char) => char.charCodeAt(0))));
  if (claims.exp * 1000 <= Date.now()) return null;
  return { id: claims.sub, name: claims.name, role: claims.role };
}
