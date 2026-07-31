# TP 11 — Advanced modules

> This practical exercise is **fully autonomous**: it depends on no other TP.
> You can clone, install and run it on its own.

## Goal

Chapter 11 explores some of Node.js' more advanced built-in modules. In this TP
you will:

- propagate a request id end-to-end through an async chain with
  `AsyncLocalStorage` (`node:async_hooks`);
- hash and verify a password with `crypto.scrypt`, a random salt and a
  timing-safe comparison (`node:crypto`);
- watch a file with `fs.watch` and stream its newly appended content on change
  (`node:fs`).

Everything relies on Node.js built-ins only — no runtime dependency, no build
step. TypeScript is executed natively by Node 24 (type stripping).

## Prerequisites

- **Node.js >= 24** (LTS). Check with `node --version`.
- TypeScript is run directly by Node — there is no compilation step.
- Note: `node:sqlite` is still **experimental** and may emit a warning or
  require a flag depending on your exact Node version.

## Setup

```bash
nvm use            # picks Node 24 from .nvmrc
npm install        # installs typescript + @types/node (dev only)
npm run typecheck  # should pass once you complete the TODOs
```

## Steps

1. **Trace a request end-to-end** — open `src/tracing.ts` and complete the
   `// TODO`s so that a request id stored in `AsyncLocalStorage` is propagated
   through the whole async chain and automatically injected into the log
   helper. Run it with `npm run trace`.
2. **Hash and verify a password** — open `src/password.ts` and complete the
   `// TODO`s to derive a key with `crypto.scrypt` over a random salt, then
   verify a candidate password using a timing-safe comparison. Run it with
   `npm run hash`.
3. **Watch a file and stream new content** — open `src/file-watch.ts` and
   complete the `// TODO`s to watch a file with `fs.watch` and stream only the
   newly appended bytes each time it changes. Run it with `npm run watch`,
   then append to the watched file (e.g. `echo hello >> watched.log`).

## Going further

- Persist the hashed passwords (salt + derived key) in a small `node:sqlite`
  database instead of keeping them in memory — note that `node:sqlite` is
  experimental.
- Combine the three modules: trace each file-change event and each password
  verification with a request id from `AsyncLocalStorage`.
