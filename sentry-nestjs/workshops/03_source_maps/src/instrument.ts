// Loaded BEFORE the app, with `node --import ./dist/instrument.js dist/main.js`:
// the SDK's OpenTelemetry instrumentation patches `http`, Express and the
// database drivers as they are loaded — a module imported before Sentry.init is
// never patched.
import { initSentry } from './sentry.js';

initSentry();
