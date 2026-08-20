# TP 3 — Node.js events

> This practical exercise is **autonomous**: it depends on no other TP. You can
> clone, run and complete it on its own.

## Goal

Apply the concepts from **chapter 3** (events in Node.js): the `EventEmitter`
API, typing events end-to-end, the special `error` event, listener lifecycle
(`on` / `once` / `off`), and the bridge to reactive streams with RxJS. By the
end you will have a typed domain emitter and a feel for when an `EventEmitter`
is enough and when a reactive operator pipeline pays off.

## Prerequisites

- **Node.js >= 24** (LTS) — TypeScript runs natively, no build step.
- No transpilation: `.ts` files are executed directly by `node`.

Check your version:

```bash
node --version   # should print v24.x or higher
```

## Setup

```bash
npm install        # pulls rxjs + dev type packages
npm run typecheck  # type-check the whole project (tsc --noEmit)
npm start          # run src/index.ts
npm run dev        # same, with --watch for live reload
```

## Steps

Open the files in `src/` and complete every `// TODO`.

1. **Typed domain emitter** — in `src/order-events.ts`, build an `EventEmitter`
   typed with an event map for an `Order` domain. Emit and subscribe to
   `order:created` and `order:paid` with their typed payloads, so that `emit`
   and `on` are checked by the compiler.
2. **Error handling & cleanup** — in `src/error-handling.ts`, wire an `error`
   listener (the event that throws if left unhandled), then register a one-shot
   handler with `once` and detach handlers with `off` to avoid leaks.
3. **Throttled tick: EventEmitter vs RxJS** — in `src/throttled-tick.ts`,
   implement the *same* throttling logic twice: once by hand on top of an
   `EventEmitter`, once with RxJS `fromEvent` + `throttleTime`. Run both from
   `src/index.ts` and compare the code.

## Going further

- Use `events.once(emitter, 'order:paid')` to `await` a single event as a promise.
- Wrap an emitter as an async iterator with `events.on(emitter, 'order:created')`
  and consume it in a `for await … of` loop.
- Tune backpressure: compare `throttleTime`, `debounceTime` and `sampleTime`,
  and observe what each drops or keeps.
- Set `emitter.setMaxListeners(n)` and trigger the "possible memory leak"
  warning on purpose to understand it.
