/**
 * The Sentry test kit — the same file for the React and the NestJS trainings.
 *
 * A fake transport that records, in memory, every envelope the SDK would have sent
 * to Sentry; and readers that flatten those envelopes into what a spec asserts on:
 * error events, spans, logs, cron check-ins, feedback.
 *
 * No SDK import on purpose: `@sentry/react` and `@sentry/nestjs` both accept a
 * `transport` factory of this shape (it is `@sentry/core`'s `Transport`).
 *
 *   const sentry = createSentryTestkit();
 *   initSentry({ dsn: TEST_DSN, transport: sentry.transport });
 *   // … exercise the app …
 *   await Sentry.flush(2000);
 *   expect(sentry.errors()).toHaveLength(1);
 */

/** A DSN that points nowhere: the fake transport never opens a connection. */
export const TEST_DSN = 'https://public@sentry.test/1';

/** `[headers, [[itemHeaders, payload], …]]` — the wire format of the SDK. */
export type Envelope = [Record<string, unknown>, Array<[{ type: string } & Record<string, unknown>, unknown]>];

/** The subset of an error event the specs read. */
export interface ErrorEvent {
  event_id?: string;
  message?: string;
  level?: string;
  release?: string;
  environment?: string;
  transaction?: string;
  fingerprint?: string[];
  tags?: Record<string, unknown>;
  user?: Record<string, unknown>;
  contexts?: Record<string, Record<string, unknown> | undefined>;
  breadcrumbs?: Array<{ category?: string; message?: string; type?: string; data?: Record<string, unknown> }>;
  request?: { url?: string; method?: string; headers?: Record<string, string>; data?: unknown; cookies?: unknown };
  exception?: { values?: Array<{ type?: string; value?: string; mechanism?: { type?: string; handled?: boolean } }> };
}

/** A streamed span (`traceLifecycle: 'stream'`, the default since SDK v11). */
export interface Span {
  name: string;
  span_id: string;
  trace_id: string;
  parent_span_id?: string;
  is_segment: boolean;
  status: 'ok' | 'error';
  attributes: Record<string, { value: unknown; type: string } | undefined>;
}

export interface LogItem {
  level: string;
  body: string;
  trace_id?: string;
  attributes: Record<string, { value: unknown; type: string } | undefined>;
}

export interface CheckIn {
  check_in_id: string;
  monitor_slug: string;
  status: 'in_progress' | 'ok' | 'error';
  monitor_config?: Record<string, unknown>;
}

export interface SentryTestkit {
  /** Pass it as the `transport` option of `Sentry.init`. */
  transport: () => {
    send(envelope: unknown): Promise<{ statusCode: number }>;
    flush(timeout?: number): Promise<boolean>;
  };
  /** Every envelope received, in order. */
  envelopes(): Envelope[];
  /** Every item payload of the given type (`event`, `span`, `log`, `check_in`, `feedback`, `session`…). */
  items<T = unknown>(type: string): T[];
  /** The error events — what becomes an issue in Sentry. */
  errors(): ErrorEvent[];
  /** Every span, from every span container, flattened. */
  spans(): Span[];
  /** Every log, from every log container, flattened. */
  logs(): LogItem[];
  checkIns(): CheckIn[];
  feedbacks(): ErrorEvent[];
  /** The last exception message of an event (the root cause comes last). */
  messageOf(event: ErrorEvent): string | undefined;
  /** The value of a span or log attribute. */
  attr(item: { attributes: Span['attributes'] }, key: string): unknown;
  /** Forget everything received so far — call it before each test. */
  reset(): void;
}

export function createSentryTestkit(): SentryTestkit {
  const received: Envelope[] = [];

  const items = <T>(type: string): T[] =>
    received.flatMap(([, entries]) => entries.filter(([header]) => header.type === type).map(([, payload]) => payload as T));

  /** Span and log items are containers: `{ version, items: [...] }`. */
  const flatten = <T>(type: string): T[] => items<{ items: T[] }>(type).flatMap((container) => container.items);

  return {
    transport: () => ({
      send: async (envelope) => {
        received.push(envelope as Envelope);
        return { statusCode: 200 };
      },
      flush: async () => true,
    }),
    envelopes: () => [...received],
    items,
    errors: () => items<ErrorEvent>('event'),
    spans: () => flatten<Span>('span'),
    logs: () => flatten<LogItem>('log'),
    checkIns: () => items<CheckIn>('check_in'),
    feedbacks: () => items<ErrorEvent>('feedback'),
    messageOf: (event) => event.exception?.values?.at(-1)?.value ?? event.message,
    attr: (item, key) => item.attributes[key]?.value,
    reset: () => {
      received.length = 0;
    },
  };
}
