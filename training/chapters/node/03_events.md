---
layout: cover
---

# 3 - Node.js events

---

# Event-driven architecture

- A large part of the Node.js API is built around the **`events`** module
- HTTP server, streams, child process, websockets... all emit and listen to events
- Built-in **Observer** pattern

```javascript
const { EventEmitter } = require('node:events');

const bus = new EventEmitter();

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

```javascript
class OrderService extends EventEmitter {
  async create(payload) {
    const order = await this.repo.save(payload);
    this.emit('order:created', order);
    return order;
  }
}

const service = new OrderService();
service.on('order:created', sendConfirmationEmail);
service.on('order:created', updateInventory);
```

---

# Errors and the `error` event

- Emitting `error` **without a listener** crashes the process

```javascript
emitter.emit('error', new Error('boom'));
// throw new Error('boom') if no listener
```

- Always wire an `error` listener or use `events.errorMonitor`

```javascript
const { errorMonitor } = require('node:events');

emitter.on(errorMonitor, (err) => {
  logger.warn('event error', err);
});
```

---

# EventEmitter and async/await

- `events.once(emitter, event)` returns a Promise
- `events.on(emitter, event)` returns an async iterable

```javascript
const { once, on } = require('node:events');

const [data] = await once(server, 'listening');

for await (const [conn] of on(server, 'connection')) {
  handle(conn);
}
```

---

# Comparison with RxJS

- **EventEmitter**: pure push, no composition, no back-pressure
- **RxJS**: Observable, operators (`map`, `filter`, `debounce`, `throttle`, `mergeMap`...)

```javascript
import { fromEvent, throttleTime, map } from 'rxjs';

fromEvent(emitter, 'tick')
  .pipe(
    throttleTime(1000),
    map(() => Date.now()),
  )
  .subscribe(console.log);
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
