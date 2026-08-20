# TP 9 — Advanced flow handling

> This TP is **autonomous**: it depends on no other TP. You can complete it in
> isolation. Everything you need lives in this directory, including a
> `docker-compose.yml` that ships the RabbitMQ and Redis services you need.

## Goal

Apply the concepts from chapter 9 (advanced flow handling) to control the rate
at which data moves through a Node.js system. You will reproduce and fix a
back-pressure problem on a slow writable stream, then move beyond a single
process: dispatching work through a **RabbitMQ** queue with proper `ack`/`nack`
handling, and broadcasting an event to several Node instances at once through
**Redis Pub/Sub**.

## Prerequisites

- **Node.js >= 24** (TypeScript runs natively, no build step).
- **Docker** (with the `docker compose` plugin) to start the infrastructure via
  `npm run infra:up`. RabbitMQ exposes AMQP on `5672` and a management UI on
  [http://localhost:15672](http://localhost:15672) (`guest`/`guest`); Redis
  listens on `6379`.

Check your version:

```bash
node --version   # must be >= 24
```

(An `.nvmrc` is provided: `nvm use`.)

## Setup

```bash
npm install            # installs amqplib, ioredis and dev dependencies
npm run infra:up       # start RabbitMQ + Redis (run this FIRST)
```

Then, depending on the task, open **several terminals**:

```bash
# RabbitMQ — terminal A and terminal B
npm run consumer       # start one (or several) consumer(s) first
npm run producer       # then push messages into the queue

# Redis Pub/Sub — terminal A, terminal B (subscribers) and terminal C (publisher)
npm run sub            # start 2 subscriber instances in 2 terminals
npm run pub            # publish an event — both subscribers receive it

# Back-pressure
npm run backpressure   # observe (then fix) the memory blow-up
```

Stop everything when you are done:

```bash
npm run infra:down
```

Type-check at any time without running:

```bash
npm run typecheck
```

## Steps

1. **Reproduce and fix a back-pressure problem** — in `src/backpressure.ts`, a
   fast readable feeds a deliberately slow writable. The starter ignores the
   return value of `write()`, so the internal buffer grows unbounded (watch RSS
   climb). Fix it with `pipeline()` from `node:stream/promises` (or by
   respecting the `write()` return value and waiting for the `drain` event) so
   memory stays flat.

2. **A RabbitMQ consumer with ack/nack** — in `src/amqp/producer.ts` publish a
   batch of messages to a queue, and in `src/amqp/consumer.ts` consume them with
   `channel.consume`. Acknowledge a message with `channel.ack` once it is
   processed successfully, and `channel.nack` (with `requeue`) when processing
   fails, so no message is silently lost. Use `prefetch` to bound in-flight work.

3. **Broadcast an event via Redis Pub/Sub** — in `src/redis/publisher.ts`
   `PUBLISH` an event on a channel, and in `src/redis/subscriber.ts`
   `SUBSCRIBE` to that same channel. Start **two** subscriber instances and
   confirm both receive every published event (fan-out), unlike a queue where a
   message goes to a single consumer.

## Going further

- **Back-pressure across the network**: RabbitMQ `prefetch` and the TCP socket's
  own back-pressure are the distributed equivalent of the `drain` event. Lower
  the prefetch and watch how the broker stops pushing.
- **Queue vs Pub/Sub**: with a RabbitMQ work queue, each message is delivered to
  exactly one consumer (competing consumers / load balancing). With Redis
  Pub/Sub, every subscriber gets every message (fan-out) but offline subscribers
  miss messages. Pick the right tool per use case — and look at Redis Streams or
  RabbitMQ topic exchanges for the middle ground.
- **Graceful shutdown**: make sure a `SIGINT` closes the channel and connection
  cleanly so in-flight messages are re-queued rather than lost.
