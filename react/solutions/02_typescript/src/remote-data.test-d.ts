import { describe, expectTypeOf, it } from 'vitest';
import { assertNever, type RemoteData } from './remote-data';

describe('RemoteData', () => {
  it('has exactly four statuses', () => {
    expectTypeOf<RemoteData<number>['status']>().toEqualTypeOf<
      'idle' | 'loading' | 'success' | 'error'
    >();
  });

  it('carries the data only in the success state, typed by T', () => {
    expectTypeOf<Extract<RemoteData<number>, { status: 'success' }>>().toEqualTypeOf<{
      status: 'success';
      data: number;
    }>();
  });

  it('carries an Error only in the error state', () => {
    expectTypeOf<Extract<RemoteData<number>, { status: 'error' }>>().toEqualTypeOf<{
      status: 'error';
      error: Error;
    }>();
  });

  it('rejects impossible states', () => {
    // @ts-expect-error — a success without data
    const noData: RemoteData<number> = { status: 'success' };
    // @ts-expect-error — data while still loading
    const early: RemoteData<number> = { status: 'loading', data: 1 };
    expectTypeOf(noData).toEqualTypeOf(early);
  });

  it('narrows on the status', () => {
    const state = { status: 'success', data: 1 } as RemoteData<number>;
    if (state.status === 'success') {
      expectTypeOf(state.data).toEqualTypeOf<number>();
    }
  });
});

describe('assertNever', () => {
  it('only accepts a value of type never', () => {
    expectTypeOf<Parameters<typeof assertNever>[0]>().toBeNever();
  });
});
