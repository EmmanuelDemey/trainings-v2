import { describe, expect, it } from 'vitest';
import { assertNever, describeRemoteData, type RemoteData } from './remote-data';

const count = (data: string[]) => `${data.length} people loaded`;

describe('describeRemoteData', () => {
  it('describes the idle state', () => {
    expect(describeRemoteData({ status: 'idle' }, count)).toBe('Nothing loaded yet');
  });

  it('describes the loading state', () => {
    expect(describeRemoteData({ status: 'loading' }, count)).toBe('Loading…');
  });

  it('delegates the success state to the function it receives', () => {
    expect(describeRemoteData({ status: 'success', data: ['Luke', 'Leia'] }, count)).toBe(
      '2 people loaded',
    );
  });

  it('shows the message of the error', () => {
    const state: RemoteData<string[]> = { status: 'error', error: new Error('Network down') };

    expect(describeRemoteData(state, count)).toBe('Something went wrong: Network down');
  });

  it('throws on a status it does not know, instead of returning undefined', () => {
    const corrupted = { status: 'stale' } as unknown as RemoteData<string[]>;

    expect(() => describeRemoteData(corrupted, count)).toThrow('Unexpected value: {"status":"stale"}');
  });
});

describe('assertNever', () => {
  it('throws with the unexpected value in the message', () => {
    expect(() => assertNever('oops' as never)).toThrow('Unexpected value: "oops"');
  });
});
