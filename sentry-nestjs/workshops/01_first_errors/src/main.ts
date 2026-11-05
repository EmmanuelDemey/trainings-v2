import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module.js';

// No Sentry.init here: src/instrument.ts has run before this file was even
// loaded — `node --import ./dist/instrument.js dist/main.js`.
const app = await NestFactory.create(AppModule);

// On SIGTERM (a deploy, a scale-down): finish the requests in flight, then give
// the SDK 2 s to send what it still buffers — events, spans, logs.
process.once('SIGTERM', async () => {
  await app.close();
  await Sentry.close(2000);
  process.exit(0);
});

await app.listen(process.env.PORT ?? 3000);
console.log(`Issue tracker API on http://localhost:${process.env.PORT ?? 3000}`);
