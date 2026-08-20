import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const CHANNEL = "events";

async function main(): Promise<void> {
  // A connection in "subscriber mode" can no longer issue normal commands —
  // dedicate one client to subscribing.
  const redis = new Redis(REDIS_URL);

  // TODO: SUBSCRIBE to CHANNEL and react to every published message.
  //   1. await redis.subscribe(CHANNEL).
  //   2. redis.on("message", (channel, payload) => { ... }) to handle events.
  //   Start TWO instances (npm run sub in 2 terminals): both must receive
  //   every event the publisher sends (fan-out), unlike a RabbitMQ work queue.
  console.log(`[subscriber] (TODO) subscribe to "${CHANNEL}"`);

  process.once("SIGINT", () => {
    redis.disconnect();
    process.exit(0);
  });
}

await main();
