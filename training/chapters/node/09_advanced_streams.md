---
layout: cover
---

# 9 - Advanced flow handling

---

# Back-pressure

- When the **producer** outpaces the **consumer**, buffers grow → memory leak / OOM
- Node streams handle back-pressure natively if you **use the right APIs**

```ts
import { pipeline } from 'node:stream/promises';

// ✗ Ignores back-pressure
src.on('data', (chunk: Buffer) => dest.write(chunk));

// ✓ Honors back-pressure
src.pipe(dest);

// ✓ Even better: pipeline
await pipeline(src, transform, dest);
```

---

# write() and drain

- `writable.write(chunk)` returns `false` when the buffer is full
- You must then **stop writing** and listen for `drain` before resuming

```ts
import type { Writable } from 'node:stream';

function writeMany(dest: Writable, items: Buffer[], cb: () => void): void {
  let i = 0;
  function next(): void {
    let canContinue = true;
    while (i < items.length && canContinue) {
      canContinue = dest.write(items[i++]);
    }
    if (i < items.length) dest.once('drain', next);
    else cb();
  }
  next();
}
```

---

# Back-pressure - highWaterMark

- Every stream has a **`highWaterMark`** that defines the internal buffer size
- Defaults: 16 KB for bytes, 16 objects in `objectMode`

```ts
import fs from 'node:fs';

const stream = fs.createReadStream('./big.log', { highWaterMark: 256 * 1024 });
```

- Increasing improves throughput but uses more RAM
- Decreasing reduces latency but multiplies loop iterations

---

# AMQP in Node.js

- **AMQP** (Advanced Message Queuing Protocol): standard for async messaging
- Brokers: **RabbitMQ** (reference), **ActiveMQ**, **Azure Service Bus**, **Qpid**
- Node library: **`amqplib`**

```bash
npm install amqplib
```

---

# AMQP - producer

```ts
import amqp from 'amqplib';

interface Order { id: number }

const conn = await amqp.connect('amqp://localhost');
const channel = await conn.createChannel();

await channel.assertQueue('orders', { durable: true });

const order: Order = { id: 1 };
channel.sendToQueue('orders', Buffer.from(JSON.stringify(order)), {
  persistent: true,
});

await channel.close();
await conn.close();
```

---

# AMQP - consumer

```ts
import type { ConsumeMessage } from 'amqplib';

const conn = await amqp.connect('amqp://localhost');
const channel = await conn.createChannel();

await channel.assertQueue('orders', { durable: true });
channel.prefetch(10); // back-pressure: max 10 in-flight messages

channel.consume('orders', async (msg: ConsumeMessage | null) => {
  if (!msg) return;
  try {
    const order: Order = JSON.parse(msg.content.toString());
    await processOrder(order);
    channel.ack(msg);
  } catch (err) {
    channel.nack(msg, false, false); // dead letter
  }
});
```

---

# AMQP - patterns

| Pattern | Description |
|---------|-------------|
| **Work queue** | Distribute a task to a worker in a pool |
| **Pub/Sub** | Broadcast to all subscribers (`fanout` exchange) |
| **Routing** | Filter by routing key (`direct`/`topic` exchange) |
| **RPC** | Request/response via `replyTo` + `correlationId` |
| **Dead letter** | Route failed messages to another queue |

---

# Pub/Sub with Redis

- Redis offers a simple, fast **Pub/Sub** mechanism
- No message persistence (unlike AMQP / Kafka)
- Library: **`ioredis`**

```ts
import Redis from 'ioredis';

const publisher = new Redis();
const subscriber = new Redis();

await subscriber.subscribe('user:created');
subscriber.on('message', (channel: string, message: string) => {
  console.log(`[${channel}]`, message);
});

await publisher.publish('user:created', JSON.stringify({ id: 1 }));
```

---

# Redis Streams

- Evolution of Pub/Sub with **persistence** and **consumer groups**

```ts
// producer
await redis.xadd('events', '*', 'type', 'login', 'user', 'manu');

// consumer (with group)
await redis.xgroup('CREATE', 'events', 'g1', '$', 'MKSTREAM');

const entries: unknown = await redis.xreadgroup(
  'GROUP', 'g1', 'consumer-1',
  'BLOCK', 5000, 'COUNT', 10,
  'STREAMS', 'events', '>',
);
```

- Alternative to Kafka for moderate volumes

---

# Real-time inter-process communication

- **WebSockets** (`ws`, `socket.io`): bidirectional client ↔ server
- **Server-Sent Events** (SSE): server → client one-way
- **gRPC**: binary RPC over HTTP/2, multi-language
- **MQTT**: very lightweight, IoT

```ts
import { WebSocketServer, type WebSocket, type RawData } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (data: RawData) => {
    wss.clients.forEach((client) => client.send(data));
  });
});
```

---

# Socket.io + Redis adapter

- Lets you **scale** Socket.io across multiple Node instances

```ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pub = createClient(); const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);

const io = new Server(httpServer, { adapter: createAdapter(pub, sub) });
```

- `emit` calls are forwarded via Redis Pub/Sub to every instance

---

# Choosing your stack

| Need | Recommended choice |
|------|--------------------|
| Deferred async tasks | RabbitMQ (AMQP) or BullMQ (Redis) |
| Massive event streaming | Kafka, Redis Streams |
| Lightweight real-time pub/sub | Redis Pub/Sub, NATS |
| Web push notifications | WebSocket + Redis adapter |
| Inter-microservice RPC | gRPC, AMQP RPC |
| Low-bandwidth IoT | MQTT |

---
layout: cover
---

# Hands-on

## Workshop 9 - Advanced flows
- Reproduce a back-pressure issue and fix it with `pipeline`
- Set up a RabbitMQ consumer with ack/nack
- Broadcast an event via Redis Pub/Sub to 2 Node instances
