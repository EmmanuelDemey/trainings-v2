# How `tsc` works

- **Scanner** — the source text into a stream of tokens
- **Parser** — the tokens into an Abstract Syntax Tree (AST)
- **Binder** — connects declarations and their uses: symbols and scopes
- **Checker** — the types: by far the biggest and slowest part
- **Emitter** — the JavaScript, the `.d.ts`, the source maps

<br />

- **TypeScript 7** is a **native port** of that compiler, written in Go:
  same command, same options, same errors — **8 to 12× faster** on a full build, in parallel
- The editor's language service runs on the same native code
- Parallelism: `--checkers <n>`, `--builders <n>` (project references),
  `--singleThreaded` to turn it off
- **No compiler API in 7.0** (a new one is planned for 7.1): tools that need it,
  like typescript-eslint, still install TypeScript 6 side by side
