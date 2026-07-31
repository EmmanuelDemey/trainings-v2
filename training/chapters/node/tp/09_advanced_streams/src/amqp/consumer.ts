import amqp from "amqplib";
import type { ConsumeMessage } from "amqplib";

const AMQP_URL = process.env.AMQP_URL ?? "amqp://localhost:5672";
const QUEUE = "tasks";

async function main(): Promise<void> {
  const connection = await amqp.connect(AMQP_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  // Bound the number of unacknowledged messages handled at once.
  await channel.prefetch(1);

  console.log(`[consumer] waiting for messages on "${QUEUE}" — Ctrl-C to quit`);

  await channel.consume(QUEUE, (message: ConsumeMessage | null) => {
    if (message === null) return; // consumer cancelled by the broker

    // TODO: implement ack / nack handling.
    //   1. Parse message.content (a Buffer) and "process" it.
    //   2. On success, acknowledge it with channel.ack(message).
    //   3. On failure, reject it with channel.nack(message, false, true)
    //      to re-queue it (or `false` for the last arg to drop / dead-letter it).
    //   Without an ack, the broker will redeliver the message forever.
    console.log("[consumer] received:", message.content.toString());
  });

  // Graceful shutdown: close the channel & connection so in-flight (un-acked)
  // messages are returned to the queue instead of being lost.
  process.once("SIGINT", () => {
    void channel.close().then(() => connection.close()).then(() => process.exit(0));
  });
}

await main();
