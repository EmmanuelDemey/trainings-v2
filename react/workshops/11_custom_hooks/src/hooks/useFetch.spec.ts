import { renderHook, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../mocks/server';
import type { Person } from '../model/person';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  it('is loading, with no data, until the response arrives', async () => {
    const { result } = renderHook(() => useFetch<Person[]>('/api/people'));

    expect(result.current).toEqual({ data: undefined, loading: true, error: null });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(6);
    expect(result.current.error).toBeNull();
  });

  it('returns an error, and stops loading, when the server answers 500', async () => {
    server.use(http.get('/api/people', () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useFetch<Person[]>('/api/people'));

    await waitFor(() => expect(result.current.error?.message).toBe('Request failed with status 500'));
    expect(result.current.loading).toBe(false);
  });

  it('sends no request, and is not loading, for a null URL', () => {
    // No handler matches nothing: a request would fail the test (onUnhandledFrame).
    const { result } = renderHook(() => useFetch<Person[]>(null));

    expect(result.current).toEqual({ data: undefined, loading: false, error: null });
  });

  it('fetches again when the URL changes', async () => {
    const { result, rerender } = renderHook(({ url }) => useFetch<Person[]>(url), {
      initialProps: { url: '/api/people?search=sky' },
    });
    await waitFor(() => expect(result.current.data).toHaveLength(1));

    rerender({ url: '/api/people?search=darth' });

    await waitFor(() => expect(result.current.data?.[0]?.name).toBe('Darth Vader'));
  });

  it('aborts the previous request, and ignores its late response, when the URL changes', async () => {
    let slowRequest: Request | undefined;
    server.use(
      http.get('/api/people/1', async ({ request }) => {
        slowRequest = request;
        await delay(200);
        return HttpResponse.json({ id: '1', name: 'Luke Skywalker' });
      }),
    );
    const { result, rerender } = renderHook(({ url }) => useFetch<Person>(url), {
      initialProps: { url: '/api/people/1' },
    });
    await waitFor(() => expect(slowRequest).toBeDefined());

    rerender({ url: '/api/people/5' });

    await waitFor(() => expect(result.current.data?.name).toBe('Leia Organa'));
    expect(slowRequest?.signal.aborted).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(result.current.data?.name).toBe('Leia Organa');
    expect(result.current.error).toBeNull();
  });

  it('aborts the request in flight when the component unmounts', async () => {
    let pending: Request | undefined;
    server.use(
      http.get('/api/people', async ({ request }) => {
        pending = request;
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );
    const { unmount } = renderHook(() => useFetch<Person[]>('/api/people'));
    await waitFor(() => expect(pending).toBeDefined());

    unmount();

    await waitFor(() => expect(pending?.signal.aborted).toBe(true));
  });
});
