// vue-tsc, run on the TypeScript 6 compiler. TypeScript 7 — the native port the
// project depends on — no longer ships the JavaScript API that vue-tsc needs to
// type check the .vue files, so vue-tsc gets the `typescript6` alias instead.
import { createRequire } from 'node:module';
import { run } from 'vue-tsc';

run(createRequire(import.meta.url).resolve('typescript6/lib/tsc'));
