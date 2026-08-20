import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const CHANNEL = "events";

async function main(): Promise<void> {
  // A connection in "subscriber mode" can no longer issue normal commands —
  // dedicate one client to subscribing. If this process also needs to GET/SET,
  // open a second client: `redis.duplicate()`.
  const redis = new Redis(REDIS_URL);

  const count = await redis.subscribe(CHANNEL);
  console.log(`[subscriber ${process.pid}] subscribed to "${CHANNEL}" (${count} channel(s))`);

  // Every subscriber receives EVERY message: this is fan-out, not a work queue.
  // Start `npm run sub` in two terminals and publish once — both print. Do the
  // same with the RabbitMQ consumer and only one of them gets each message.
  redis.on("message", (channel: string, payload: string) => {
    console.log(`[subscriber ${process.pid}] ${channel}:`, JSON.parse(payload));
  });

  process.once("SIGINT", () => {
    redis.disconnect();
    process.exit(0);
  });
}

await main();
