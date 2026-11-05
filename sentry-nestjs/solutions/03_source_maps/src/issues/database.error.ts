/**
 * What the database driver throws when it loses its connection — the kind of
 * error a developer must fix (or at least know about): it is never the caller's
 * fault, so it is never an HttpException.
 */
export class DatabaseError extends Error {
  override readonly name = 'DatabaseError';

  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}
