import { describe, expect, it, vi } from 'vitest';
import { usernameSchema } from '../src/schemas/username';

/** A fake server where only `nina` is taken — and that counts its calls. */
function fakeServer() {
  return vi.fn(async (username: string) => username === 'nina');
}

describe('usernameSchema', () => {
  it('accepts a free username', async () => {
    const result = await usernameSchema(fakeServer()).safeParseAsync('fela_kuti');
    expect(result.success).toBe(true);
  });

  it('rejects a taken username, with a message the form can show', async () => {
    const result = await usernameSchema(fakeServer()).safeParseAsync('nina');
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(['This username is already taken']);
  });

  it('cannot be parsed synchronously: the check is async', () => {
    expect(() => usernameSchema(fakeServer()).parse('fela_kuti')).toThrow();
  });

  it.each(['ab', 'Nina!', 'a'.repeat(21)])('never asks the server about %s, which is malformed', async (username) => {
    const isTaken = fakeServer();

    const result = await usernameSchema(isTaken).safeParseAsync(username);

    expect(result.success).toBe(false);
    expect(isTaken).not.toHaveBeenCalled();
  });
});
