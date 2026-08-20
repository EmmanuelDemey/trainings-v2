import amqp from "amqplib";
import type { ConsumeMessage } from "amqplib";

const AMQP_URL = process.env.AMQP_URL ?? "amqp://localhost:5672";
const QUEUE = "tasks";

interface Task {
  id: number;
  text: string;
}

async function main(): Promise<void> {
  const connection = await amqp.connect(AMQP_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  // Bound the number of unacknowledged messages handled at once.
  //
  // Without `prefetch`, RabbitMQ pushes the ENTIRE queue at this consumer the
  // moment it connects — the AMQP equivalent of the back-pressure bug in
  // src/backpressure.ts. With `1`, the broker sends the next message only once
  // this one is acked, so two consumers actually share the work.
  await channel.prefetch(1);

  console.log(`[consumer] waiting for messages on "${QUEUE}" — Ctrl-C to quit`);

  await channel.consume(QUEUE, (message: ConsumeMessage | null) => {
    if (message === null) return; // consumer cancelled by the broker

    try {
      const task = JSON.parse(message.content.toString()) as Task;

      // Pretend task #4 is poison, to exercise the nack path.
      if (task.id === 4 && message.fields.redelivered === false) {
        throw new Error(`task ${task.id} failed on first attempt`);
      }

      console.log(`[consumer] done: ${task.text}`);

      // Ack AFTER the work, never before: an ack is a promise to the broker
      // that the message will not need redelivering. Ack first and a crash
      // mid-processing loses the message for good.
      channel.ack(message);
    } catch (error) {
      console.log(`[consumer] failed: ${(error as Error).message}`);

      // (message, allUpTo = false, requeue = !alreadyRedelivered).
      //
      // Requeueing unconditionally is how you build an infinite redelivery loop
      // that pins a CPU at 100%. Retry once, then let it go to the dead-letter
      // exchange (or drop it) so a poison message cannot take the consumer down.
      channel.nack(message, false, !message.fields.redelivered);
    }
  });

  // Graceful shutdown: close the channel & connection so in-flight (un-acked)
  // messages are returned to the queue instead of being lost.
  process.once("SIGINT", () => {
    void channel.close().then(() => connection.close()).then(() => process.exit(0));
  });
}

await main();
