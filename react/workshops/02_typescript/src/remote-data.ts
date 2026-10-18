// TODO 2.1: turn this bag of optional fields into a discriminated union of
//           four states: idle, loading, success (with `data: T`) and error
//           (with `error: Error`). Impossible states must stop compiling.
export type RemoteData<T> = {
  status: string;
  data?: T;
  error?: Error;
};

// TODO 2.3: throw an Error whose message is `Unexpected value: ` followed by
//           the value as JSON.
export function assertNever(_value: never): never {
  throw new Error('TODO');
}

// TODO 2.2: return a sentence for each state — a `switch` on `state.status`,
//           and `assertNever(state)` in the `default` branch.
export function describeRemoteData<T>(
  _state: RemoteData<T>,
  _describeData: (data: T) => string,
): string {
  return '';
}
