---
layout: cover
---

# 9 - Gestion avancée des flux

---

# Back-pressure

- Quand le **producteur** va plus vite que le **consommateur**, les buffers grossissent → fuite mémoire / OOM
- Les streams Node gèrent nativement le back-pressure si on **utilise les bonnes API**

```javascript
// ✗ Ignore le back-pressure
src.on('data', (chunk) => dest.write(chunk));

// ✓ Respecte le back-pressure
src.pipe(dest);

// ✓ Encore mieux : pipeline
await pipeline(src, transform, dest);
```

---

# write() et drain

- `writable.write(chunk)` retourne `false` quand le buffer est plein
- Il faut alors **arrêter d'écrire** et écouter `drain` avant de reprendre

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

- Chaque stream a un **`highWaterMark`** définissant la taille du buffer interne
- Par défaut : 16 ko pour les bytes, 16 objets pour `objectMode`

```javascript
const stream = fs.createReadStream('./big.log', { highWaterMark: 256 * 1024 });
```

- Augmenter améliore le débit mais consomme plus de RAM
- Diminuer améliore la latence mais multiplie les boucles

---

# AMQP dans Node.js

- **AMQP** (Advanced Message Queuing Protocol) : standard de messaging async
- Brokers : **RabbitMQ** (référence), **ActiveMQ**, **Azure Service Bus**, **Qpid**
- Lib Node : **`amqplib`**

```bash
npm install amqplib
```

---

# AMQP - producteur

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

# AMQP - consommateur

```javascript
const conn = await amqp.connect('amqp://localhost');
const channel = await conn.createChannel();

await channel.assertQueue('orders', { durable: true });
channel.prefetch(10); // back-pressure : max 10 msg en cours

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
| **Work queue** | Distribuer une tâche à un worker dans un pool |
| **Pub/Sub** | Diffuser à tous les abonnés (exchange `fanout`) |
| **Routing** | Filtrer par routing key (exchange `direct`/`topic`) |
| **RPC** | Requête/réponse via `replyTo` + `correlationId` |
| **Dead letter** | Acheminer les messages échoués vers une autre queue |

---

# Pub/Sub avec Redis

- Redis offre un mécanisme **Pub/Sub** simple et rapide
- Pas de persistance des messages (au contraire d'AMQP / Kafka)
- Lib : **`ioredis`**

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

- Évolution de Pub/Sub avec **persistance** et **consumer groups**

```javascript
// producteur
await redis.xadd('events', '*', 'type', 'login', 'user', 'manu');

// consommateur (avec groupe)
await redis.xgroup('CREATE', 'events', 'g1', '$', 'MKSTREAM');

const entries = await redis.xreadgroup(
  'GROUP', 'g1', 'consumer-1',
  'BLOCK', 5000, 'COUNT', 10,
  'STREAMS', 'events', '>',
);
```

- Alternative à Kafka pour des volumes modérés

---

# Communication inter-process en temps réel

- **WebSockets** (`ws`, `socket.io`) : bidirectionnel client ↔ serveur
- **Server-Sent Events** (SSE) : serveur → client unidirectionnel
- **gRPC** : RPC binaire HTTP/2, multi-langage
- **MQTT** : très léger, IoT

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

- Permet de **scale** Socket.io sur plusieurs instances Node

```javascript
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pub = createClient(); const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);

const io = new Server(httpServer, { adapter: createAdapter(pub, sub) });
```

- Les `emit` sont relayés via Redis Pub/Sub à toutes les instances

---

# Choisir sa techno

| Besoin | Choix recommandé |
|--------|------------------|
| Tâches asynchrones différées | RabbitMQ (AMQP) ou BullMQ (Redis) |
| Event streaming massif | Kafka, Redis Streams |
| Pub/Sub léger temps réel | Redis Pub/Sub, NATS |
| Notifications push web | WebSocket + Redis adapter |
| RPC inter-microservices | gRPC, AMQP RPC |
| IoT bas débit | MQTT |

---
layout: cover
---

# Travaux Pratiques

## Atelier 9 - Flux avancés
- Reproduire un cas de back-pressure et le corriger avec `pipeline`
- Mettre en place un consumer RabbitMQ avec ack/nack
- Diffuser un événement via Redis Pub/Sub à 2 instances Node
