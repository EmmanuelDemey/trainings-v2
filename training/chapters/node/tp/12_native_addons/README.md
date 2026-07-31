# TP 12 — Native addons

> This practical exercise is **fully autonomous**: it depends on no other TP.
> You can clone, install and run it on its own.

## Goal

Chapter 12 explores how to extend Node.js with **native code**. In this TP you
will build a C++ **Node-API** addon with `node-addon-api`, compile it with
`node-gyp`, call it from TypeScript, and measure how a CPU-heavy computation
performs in native code versus pure JavaScript. You will:

- compile a Hello World Node-API addon and call it from JS;
- expose a heavy computation (Fibonacci) from the addon;
- benchmark the native addon against its pure-JS equivalent.

## Prerequisites

- **Node.js >= 24** (an `.nvmrc` is provided — run `nvm use`).
- A working **C/C++ toolchain** for `node-gyp`:
  - **Linux**: `build-essential` and `python3`
    (e.g. `sudo apt install build-essential python3`).
  - **macOS**: the Xcode Command Line Tools (`xcode-select --install`).
  - **Windows**: Node 24 requires **ClangCL** (install the "Desktop development
    with C++" workload from Visual Studio Build Tools, including the Clang
    toolset) plus Python 3.

## Setup

```bash
npm install        # install node-addon-api, node-gyp and the dev tooling
npm run build      # node-gyp configure build -> build/Release/addon.node
npm start          # run src/index.ts and call the addon
```

If you change the C++ sources, recompile from scratch with `npm run rebuild`.

## Steps

1. **Compile and call Hello World.** Run `npm run build` to compile
   `src/addon.cc`. The `hello()` function is already implemented and exported.
   In `src/index.ts`, complete the `// TODO` to call `addon.hello()` and log its
   result, then run `npm start`.

2. **Expose a heavy computation.** Implement `fib(n)` in `src/addon.cc`
   (follow the `// TODO` comments: validate the argument, compute the n-th
   Fibonacci number with the naive recursive algorithm, return it) and export it
   from `Init`. Rebuild with `npm run rebuild`, then call `addon.fib(40)` from
   `src/index.ts`.

3. **Benchmark native vs JS.** In `src/bench.ts`, complete the `// TODO`s to time
   both the pure-TS `fibTs(N)` and the native `addon.fib(N)` with
   `performance.now()`, and print the speed-up ratio. Run it with `npm run bench`.

## Going further

- **WebAssembly**: for portable, sandboxed native-speed code without a per-platform
  toolchain, compile C/C++/Rust to `.wasm` and load it with the built-in
  `WebAssembly` API — no `node-gyp` build step on the user's machine.
- **napi-rs**: write Node-API addons in **Rust** instead of C++ with
  [`napi-rs`](https://napi.rs/), getting memory safety and a modern build pipeline
  while staying ABI-compatible with Node-API.
