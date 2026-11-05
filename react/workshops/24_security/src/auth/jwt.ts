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

/**
 * Reads the claims of a JWT — WITHOUT verifying its signature. The browser has
 * no key to verify it with, and does not need one: it only reads the claims to
 * render the UI. The API verifies the signature on every request.
 */
export function decodeJwt(token: string): JwtClaims {
  // TODO 1.1: split on '.'; anything but 3 parts throws 'Malformed token: …'.
  // TODO 1.2: the payload is the 2nd part, in base64URL: replace '-' by '+' and
  //   '_' by '/', pad with '=' to a multiple of 4, `atob` it. `atob` gives
  //   BYTES as a string: turn them into a `Uint8Array` and `TextDecoder` them,
  //   or an "é" comes out garbled. Then `JSON.parse`; a failure throws
  //   'Malformed token: …' too.
  void token;
  throw new Error('TODO 1: decodeJwt is not written yet');
}

/**
 * Whether the token is expired at `now` (in ms), or will be within `leewaySeconds`:
 * refreshing a little early beats a request that dies in flight.
 */
export function isExpired(claims: Pick<JwtClaims, 'exp'>, now = Date.now(), leewaySeconds = 30): boolean {
  // TODO 1.3: `exp` is in SECONDS, `now` in MILLISECONDS.
  void claims;
  void now;
  void leewaySeconds;
  return false;
}
