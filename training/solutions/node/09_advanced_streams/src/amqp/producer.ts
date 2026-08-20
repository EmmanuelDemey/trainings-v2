import amqp from "amqplib";

const AMQP_URL = process.env.AMQP_URL ?? "amqp://localhost:5672";
const QUEUE = "tasks";

async function main(): Promise<void> {
  const connection = await amqp.connect(AMQP_URL);
  try {
    const channel = await connection.createChannel();
    // `durable: true` survives a broker restart — but only for messages that
    // are themselves `persistent`. Both halves are needed, neither is enough.
    await channel.assertQueue(QUEUE, { durable: true });

    for (let i = 1; i <= 10; i++) {
      const payload = { id: i, text: `task #${i}` };
      // `sendToQueue` returns false under back-pressure, exactly like a stream's
      // `write()`. At ten messages it never will; at ten thousand it would, and
      // you would wait for the channel's 'drain' event before continuing.
      channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
      });
      console.log(`[producer] sent ${payload.text}`);
    }

    // Closing the channel flushes what is still buffered; closing the
    // connection first would drop it.
    await channel.close();
  } finally {
    await connection.close();
  }
}

await main();
