import type { Role } from '../model/user';

/** The claims this app reads from an access token. */
export interface JwtClaims {
  /** The user id. */
  sub: string;
  name: string;
  role: Role;
  /** Issued at, in SECONDS since the epoch. */
  iat: number;
  /** Expires at, in SECONDS since the epoch. */
  exp: number;
}

/** base64url → text: `-` and `_` instead of `+` and `/`, padding dropped, UTF-8 inside. */
function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

/**
 * Reads the claims of a JWT — WITHOUT verifying its signature. The browser has
 * no key to verify it with, and does not need one: it only reads the claims to
 * render the UI. The API verifies the signature on every request.
 */
export function decodeJwt(token: string): JwtClaims {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token: expected header.payload.signature');
  try {
    return JSON.parse(base64UrlDecode(parts[1]!)) as JwtClaims;
  } catch {
    throw new Error('Malformed token: the payload is not base64url-encoded JSON');
  }
}

/**
 * Whether the token is expired at `now` (in ms), or will be within `leewaySeconds`:
 * refreshing a little early beats a request that dies in flight.
 */
export function isExpired(claims: Pick<JwtClaims, 'exp'>, now = Date.now(), leewaySeconds = 30): boolean {
  return claims.exp * 1000 <= now + leewaySeconds * 1000;
}
