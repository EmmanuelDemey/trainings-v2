// A discriminated union: every member has a `status` literal, and checking it
// narrows the value — `data` only exists once you know it is a success.
export type RemoteData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

/** Never called on purpose: a call that compiles means a case was forgotten. */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

export function describeRemoteData<T>(
  state: RemoteData<T>,
  describeData: (data: T) => string,
): string {
  switch (state.status) {
    case 'idle':
      return 'Nothing loaded yet';
    case 'loading':
      return 'Loading…';
    case 'success':
      return describeData(state.data);
    case 'error':
      return `Something went wrong: ${state.error.message}`;
    default:
      // Every case is handled, so `state` is `never` here. Add a fifth status
      // to RemoteData and THIS line stops compiling — the exhaustiveness check.
      return assertNever(state);
  }
}
