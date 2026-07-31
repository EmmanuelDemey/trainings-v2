---
layout: cover
---

# 12 - Native addons

---

# Why a native addon?

- Reuse an existing **C/C++ library** (e.g. OpenCV, FFmpeg, libsodium)
- **Extreme performance** for CPU-bound computations
- Access **system APIs** not exposed by Node
- ⚠️ Before going there, consider:
  - Worker Threads
  - WebAssembly (wasm)
  - Separate Rust/Go service called via HTTP/gRPC

---

# Three available APIs

| API | When to use |
|-----|-------------|
| **Node-API (N-API)** | **Recommended**: stable ABI, compatible with all Node versions |
| **NAN** (Native Abstractions for Node) | Legacy, migrate to Node-API |
| **V8 / libuv directly** | Advanced cases, fragile across versions |
| **Embedder API** | Embed Node.js into a C++ application |

---

# Node-API (N-API)

- Stable **C** API, independent of V8 versions
- Also available in **C++** via **`node-addon-api`** (more ergonomic wrapper)
- Built with **`node-gyp`** (then **`prebuildify`** to ship precompiled binaries)

```bash
npm install node-addon-api
npm install -g node-gyp
```

---

# Addon structure

```
my-addon/
├── binding.gyp        # build config
├── package.json
├── src/
│   └── addon.cc       # C++ code
└── index.js           # require('./build/Release/addon.node')
```

---

# binding.gyp

```python
{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "src/addon.cc" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ]
    }
  ]
}
```

---

# Example - Hello World

```cpp
// src/addon.cc
#include <napi.h>

Napi::String Hello(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello from C++");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("hello", Napi::Function::New(env, Hello));
  return exports;
}

NODE_API_MODULE(addon, Init)
```

```ts
// index.ts
import { createRequire } from 'node:module';

interface Addon {
  hello(): string;
}

const require = createRequire(import.meta.url);
const addon: Addon = require('./build/Release/addon.node');
console.log(addon.hello()); // "Hello from C++"
```

```bash
node-gyp configure build
```

---

# Async work

- To **avoid blocking the event loop**, use an `AsyncWorker`

```cpp
class HashWorker : public Napi::AsyncWorker {
public:
  HashWorker(Napi::Function& cb, std::string input)
    : AsyncWorker(cb), input(std::move(input)) {}

  void Execute() override {
    // runs on a libuv thread pool thread
    result = compute_sha256(input);
  }

  void OnOK() override {
    Callback().Call({ Env().Null(), Napi::String::New(Env(), result) });
  }

private:
  std::string input;
  std::string result;
};
```

---

# Embedder API

- Lets you **embed** Node.js as a **library** inside an existing C++ application
- Use cases: editors (VS Code), desktop products embedding a JS runtime
- API exposed via **`libnode`**

```cpp
#include <node.h>
#include <uv.h>

int main(int argc, char** argv) {
  std::vector<std::string> args(argv, argv + argc);
  std::vector<std::string> exec_args;
  std::vector<std::string> errors;

  int exit_code = node::InitializeNodeWithArgs(&args, &exec_args, &errors);
  // ... start a Node environment
  return exit_code;
}
```

- More complex: less stable ABI, custom build

---

# Modern alternatives

- **WebAssembly**:
  - Compile C/C++/Rust/Go to `.wasm`
  - Load via `WebAssembly.instantiate`
  - Native **sandbox**, cross-platform, no `node-gyp`
- **Rust + neon / napi-rs**:
  - Write the addon in Rust with memory safety
  - **`napi-rs`** is the de-facto ecosystem (cargo-npm)

```rust
// napi-rs
use napi_derive::napi;

#[napi]
fn hello() -> String {
  "Hello from Rust".to_string()
}
```

---

# Distribution

- Compiling C/C++ requires a **toolchain** on the target machine
- Solutions:
  - **`prebuildify`**: precompiled binaries per OS/arch in the npm tarball
  - **`prebuild-install`**: download on install
  - **`node-pre-gyp`**: historic variant
- Test on Linux x64/arm64, macOS x64/arm64, Windows x64

---

# When NOT to write an addon

- You only want **parallelism**: Worker Threads are enough
- You only want **more JS perf**: optimize the code, profile it
- You want to integrate **an HTTP library**: REST/gRPC call to a separate service
- You want to use **Rust**: start with WebAssembly, escalate to `napi-rs` if needed
- The maintenance cost of a native addon is **high**: only pay it when the value is clear

---

# Hands-on

## Workshop 12 - Native addons
- Compile a "Hello World" Node-API addon with `node-gyp` and call it from JS
- Expose a function doing a heavy computation (e.g. Fibonacci) in the addon
- Benchmark the addon against the pure-JS equivalent with `autocannon` / `perf_hooks`

---
layout: cover
---

# Training conclusion

- You have covered the **advanced** fundamentals of Node.js
- You can **profile**, **debug**, **scale** an application
- You master **streams**, **events**, **advanced modules**
- Keep practicing! Useful links:
  - https://nodejs.org/api/
  - https://nodejs.org/en/learn/
  - https://github.com/goldbergyoni/nodebestpractices
