import { vi } from 'vitest';

/** A request captured by the mock, still in flight until you settle it. */
export interface PendingRequest {
  readonly url: string;
  readonly signal: AbortSignal | undefined;
  /** `true` once the composable aborted this request through its signal. */
  readonly aborted: boolean;
  /** Settles the request with a `200` JSON response. */
  json(body: unknown): void;
  /** Settles the request with a body-less response — `500`, `404`, … */
  status(status: number): void;
  /** Rejects the request the way a real network failure does. */
  fail(error?: Error): void;
}

export interface FetchMock extends Disposable {
  /** Every request made since the mock was installed, in order. */
  requests: PendingRequest[];
  /** The most recent request. Throws if none was made. */
  last(): PendingRequest;
  restore(): void;
}

/**
 * Replaces `fetch` with a mock that never resolves on its own: each test decides
 * *when* a request settles, which is the only way to observe `loading` and to
 * check that switching URLs aborts the previous request.
 *
 * It honours `AbortSignal` like the real thing — an aborted request rejects with
 * a `DOMException` named `AbortError`.
 *
 *   using http = installFetchMock();   // restored at the end of the scope
 */
export function installFetchMock(): FetchMock {
  const requests: PendingRequest[] = [];
  const originalFetch = globalThis.fetch;

  const mock = vi.fn((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const signal = init?.signal ?? undefined;

    let settle!: { resolve: (response: Response) => void; reject: (reason: unknown) => void };
    const response = new Promise<Response>((resolve, reject) => {
      settle = { resolve, reject };
    });

    signal?.addEventListener('abort', () => {
      settle.reject(new DOMException('The operation was aborted.', 'AbortError'));
    });

    requests.push({
      url,
      signal,
      get aborted() {
        return signal?.aborted ?? false;
      },
      json(body) {
        settle.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      },
      status(status) {
        settle.resolve(new Response(null, { status }));
      },
      fail(error = new TypeError('Failed to fetch')) {
        settle.reject(error);
      },
    });

    return response;
  });

  globalThis.fetch = mock as unknown as typeof fetch;

  const restore = (): void => {
    globalThis.fetch = originalFetch;
  };

  return {
    requests,
    last() {
      const request = requests.at(-1);
      if (!request) throw new Error('No request was made yet.');
      return request;
    },
    restore,
    [Symbol.dispose]: restore,
  };
}
