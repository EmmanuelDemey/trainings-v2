---
layout: cover
---

# 3 - Node.js events

---

# Event-driven architecture

- A large part of the Node.js API is built around the **`events`** module
- HTTP server, streams, child process, websockets... all emit and listen to events
- Built-in **Observer** pattern

```ts
import { EventEmitter } from 'node:events';

interface User { id: number; email: string }
type AppEvents = { 'user:created': [user: User] };

const bus = new EventEmitter<AppEvents>();

bus.on('user:created', (user) => {
  console.log('New user:', user.id);
});

bus.emit('user:created', { id: 1, email: 'manu@sparks.fr' });
```

---

# EventEmitter - main API

| Method | Description |
|--------|-------------|
| `on(event, listener)` | Subscribe a listener |
| `once(event, listener)` | Subscribe for a single emission |
| `off / removeListener` | Unsubscribe |
| `emit(event, ...args)` | Trigger the listeners |
| `removeAllListeners(event?)` | Clear listeners |
| `listenerCount(event)` | Number of listeners |
| `setMaxListeners(n)` | Disable the warning at 10 listeners |

---

# Inheritance and composition

- You can **extend** EventEmitter to build your own observable components

```ts
type OrderEvents = { 'order:created': [order: Order] };

class OrderService extends EventEmitter<OrderEvents> {
  constructor(private repo: OrderRepository) { super(); }

  async create(payload: OrderInput): Promise<Order> {
    const order = await this.repo.save(payload);
    this.emit('order:created', order);
    return order;
  }
}

const service = new OrderService(repo);
service.on('order:created', sendConfirmationEmail);
service.on('order:created', updateInventory);
```

---

# Errors and the `error` event

- Emitting `error` **without a listener** crashes the process

```ts
emitter.emit('error', new Error('boom'));
// throw new Error('boom') if no listener
```

- Always wire an `error` listener or use `events.errorMonitor`

```ts
import { errorMonitor } from 'node:events';

emitter.on(errorMonitor, (err: Error) => {
  logger.warn('event error', err);
});
```

---

# EventEmitter and async/await

- `events.once(emitter, event)` returns a Promise
- `events.on(emitter, event)` returns an async iterable

```ts
import { once, on } from 'node:events';
import type { Server, Socket } from 'node:net';

const [data] = await once(server as Server, 'listening');

for await (const [conn] of on(server as Server, 'connection')) {
  handle(conn as Socket);
}
```

---

# Comparison with RxJS

- **EventEmitter**: pure push, no composition, no back-pressure
- **RxJS**: Observable, operators (`map`, `filter`, `debounce`, `throttle`, `mergeMap`...)

```ts
import { fromEvent, throttleTime, map } from 'rxjs';

fromEvent(emitter, 'tick')
  .pipe(
    throttleTime(1000),
    map((): number => Date.now()),
  )
  .subscribe((ts: number) => console.log(ts));
```

- Useful when you need to **compose** complex event flows

---

# Distributed event-driven architecture

- Beyond a single Node.js process, event-driven scales to **multiple services**
  - Brokers: **Kafka**, **RabbitMQ** (AMQP), **NATS**, **Redis Streams**
  - CQRS / Event Sourcing
  - SAGA pattern for cross-service consistency
- Pros:
  - **Decoupling** between producers and consumers
  - Horizontal scalability
  - Replayable history
- Cons:
  - Operational complexity
  - Eventual consistency, not immediate

---

# Best practices

- Prefix events with a domain (`user:created`, `order:paid`)
- Document payloads (TS types, JSON schemas)
- Always clean up listeners to avoid **memory leaks**
- Limit the number of listeners (`setMaxListeners` is a warning, not a hard wall)
- Prefer a dedicated module for the application-wide event bus

---

# Hands-on

## Workshop 3 - Events
- Build a domain `EventEmitter` (e.g. `order:created`, `order:paid`) with a typed payload
- Handle the `error` event and clean up listeners with `once` / `off`
- Implement the same throttled-tick logic with EventEmitter, then with RxJS, and compare
