import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const CHANNEL = "events";

async function main(): Promise<void> {
  const redis = new Redis(REDIS_URL);
  try {
    // TODO: PUBLISH an event on CHANNEL.
    //   - Use redis.publish(CHANNEL, JSON.stringify(event)).
    //   - The return value is the number of subscribers that received it:
    //     log it to confirm both subscriber instances are connected.
    const event = { type: "user.created", at: new Date().toISOString() };
    void event; // remove once you actually publish it
    // const received = await redis.publish(CHANNEL, JSON.stringify(event));
    // console.log(`[publisher] delivered to ${received} subscriber(s)`);
  } finally {
    redis.disconnect();
  }
}

await main();
