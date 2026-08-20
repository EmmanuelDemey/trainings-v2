import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const CHANNEL = "events";

async function main(): Promise<void> {
  const redis = new Redis(REDIS_URL);
  try {
    const event = { type: "user.created", at: new Date().toISOString() };

    // PUBLISH returns the number of subscribers the message was delivered to.
    // Note what that means: Redis Pub/Sub is FIRE AND FORGET. A subscriber that
    // is down when you publish never sees the event — there is no queue, no
    // persistence, no redelivery. That is the trade-off against RabbitMQ above.
    const received = await redis.publish(CHANNEL, JSON.stringify(event));
    console.log(`[publisher] ${event.type} delivered to ${received} subscriber(s)`);

    if (received === 0) {
      console.log("[publisher] nobody was listening — the event is gone for good");
    }
  } finally {
    redis.disconnect();
  }
}

await main();
