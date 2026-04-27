---
layout: cover
---

# 9 - Advanced flow handling

---

# Back-pressure

- When the **producer** outpaces the **consumer**, buffers grow → memory leak / OOM
- Node streams handle back-pressure natively if you **use the right APIs**

```javascript
// ✗ Ignores back-pressure
src.on('data', (chunk) => dest.write(chunk));

// ✓ Honors back-pressure
src.pipe(dest);

// ✓ Even better: pipeline
await pipeline(src, transform, dest);
```

---

# write() and drain

- `writable.write(chunk)` returns `false` when the buffer is full
- You must then **stop writing** and listen for `drain` before resuming

```javascript
function writeMany(dest, items, cb) {
  let i = 0;
  function next() {
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

```javascript
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

```javascript
const amqp = require('amqplib');

const conn = await amqp.connect('amqp://localhost');
const channel = await conn.createChannel();

await channel.assertQueue('orders', { durable: true });

channel.sendToQueue('orders', Buffer.from(JSON.stringify({ id: 1 })), {
  persistent: true,
});

await channel.close();
await conn.close();
```

---

# AMQP - consumer

```javascript
const conn = await amqp.connect('amqp://localhost');
const channel = await conn.createChannel();

await channel.assertQueue('orders', { durable: true });
channel.prefetch(10); // back-pressure: max 10 in-flight messages

channel.consume('orders', async (msg) => {
  try {
    const order = JSON.parse(msg.content.toString());
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

```javascript
const Redis = require('ioredis');

const publisher = new Redis();
const subscriber = new Redis();

await subscriber.subscribe('user:created');
subscriber.on('message', (channel, message) => {
  console.log(`[${channel}]`, message);
});

await publisher.publish('user:created', JSON.stringify({ id: 1 }));
```

---

# Redis Streams

- Evolution of Pub/Sub with **persistence** and **consumer groups**

```javascript
// producer
await redis.xadd('events', '*', 'type', 'login', 'user', 'manu');

// consumer (with group)
await redis.xgroup('CREATE', 'events', 'g1', '$', 'MKSTREAM');

const entries = await redis.xreadgroup(
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

```javascript
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    wss.clients.forEach((client) => client.send(data));
  });
});
```

---

# Socket.io + Redis adapter

- Lets you **scale** Socket.io across multiple Node instances

```javascript
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

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
