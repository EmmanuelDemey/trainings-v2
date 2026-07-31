import amqp from "amqplib";

const AMQP_URL = process.env.AMQP_URL ?? "amqp://localhost:5672";
const QUEUE = "tasks";

async function main(): Promise<void> {
  const connection = await amqp.connect(AMQP_URL);
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    // TODO: publish a batch of messages onto QUEUE.
    //   - Use channel.sendToQueue(QUEUE, Buffer.from(...)) for each message.
    //   - Pass { persistent: true } so messages survive a broker restart.
    //   - Log what you send so you can match it against the consumer output.
    for (let i = 1; i <= 10; i++) {
      const payload = { id: i, text: `task #${i}` };
      void payload; // remove once you actually publish it
      // channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), { persistent: true });
    }

    await channel.close();
  } finally {
    await connection.close();
  }
}

await main();
