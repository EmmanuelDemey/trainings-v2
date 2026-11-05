import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from '../app.module.js';

/** The whole app, as `main.ts` builds it — without listening on a port. */
export async function createApp(): Promise<INestApplication & AsyncDisposable> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  await app.init();
  return Object.assign(app, { [Symbol.asyncDispose]: () => app.close() });
}

/** Waits until the SDK has handed everything to the transport. */
export async function flushed(): Promise<void> {
  await Sentry.flush(2000);
}
