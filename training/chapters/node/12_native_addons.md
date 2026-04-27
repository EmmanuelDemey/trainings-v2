---
layout: cover
---

# 12 - Addons natifs

---

# Pourquoi un addon natif ?

- Réutiliser une **bibliothèque C/C++** existante (ex: OpenCV, FFmpeg, libsodium)
- **Performances extrêmes** sur des calculs CPU-bound
- Accéder à des **APIs système** non exposées par Node
- ⚠️ Avant de partir là-dessus, considérer :
  - Worker Threads
  - WebAssembly (wasm)
  - Service séparé en Rust/Go appelé via HTTP/gRPC

---

# Trois APIs disponibles

| API | Quand l'utiliser |
|-----|------------------|
| **Node-API (N-API)** | **Recommandé** : ABI stable, compatible toutes versions Node |
| **NAN** (Native Abstractions for Node) | Legacy, à migrer vers Node-API |
| **V8 / libuv direct** | Cas avancés, fragile entre versions |
| **Embedder API** | Embarquer Node.js dans une appli C++ |

---

# Node-API (N-API)

- API **C** stable, indépendante des versions de V8
- Disponible aussi en **C++** via **`node-addon-api`** (wrapper plus ergonomique)
- Compilation via **`node-gyp`** (puis **`prebuildify`** pour distribuer des binaires précompilés)

```bash
npm install node-addon-api
npm install -g node-gyp
```

---

# Structure d'un addon

```
my-addon/
├── binding.gyp        # config de build
├── package.json
├── src/
│   └── addon.cc       # code C++
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

# Exemple - Hello World

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

```javascript
// index.js
const addon = require('./build/Release/addon.node');
console.log(addon.hello()); // "Hello from C++"
```

```bash
node-gyp configure build
```

---

# Async work

- Pour ne **pas bloquer l'event loop**, utiliser un `AsyncWorker`

```cpp
class HashWorker : public Napi::AsyncWorker {
public:
  HashWorker(Napi::Function& cb, std::string input)
    : AsyncWorker(cb), input(std::move(input)) {}

  void Execute() override {
    // s'exécute sur un thread du pool libuv
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

- Permet d'**embarquer** Node.js comme **bibliothèque** dans une application C++ existante
- Cas d'usage : éditeurs (VS Code), produits desktop intégrant un runtime JS
- API exposée via **`libnode`**

```cpp
#include <node.h>
#include <uv.h>

int main(int argc, char** argv) {
  std::vector<std::string> args(argv, argv + argc);
  std::vector<std::string> exec_args;
  std::vector<std::string> errors;

  int exit_code = node::InitializeNodeWithArgs(&args, &exec_args, &errors);
  // ... lancer un environnement Node
  return exit_code;
}
```

- Plus complexe : ABI moins stable, build personnalisé

---

# Alternatives modernes

- **WebAssembly** :
  - Compiler du C/C++/Rust/Go en `.wasm`
  - Charger via `WebAssembly.instantiate`
  - **Sandbox** native, multiplateforme, pas de `node-gyp`
- **Rust + neon / napi-rs** :
  - Écrire l'addon en Rust avec memory safety
  - **`napi-rs`** est l'écosystème de référence (cargo-npm)

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

- Compiler en C/C++ nécessite **toolchain** sur la machine cible
- Solutions :
  - **`prebuildify`** : binaires précompilés par OS/arch dans le tarball npm
  - **`prebuild-install`** : téléchargement à l'install
  - **`node-pre-gyp`** : variante historique
- Tester sur Linux x64/arm64, macOS x64/arm64, Windows x64

---

# Quand NE PAS écrire un addon

- Vous voulez juste **paralléliser** : Worker Threads suffisent
- Vous voulez juste **plus de perf JS** : optimiser le code, profiler
- Vous voulez intégrer **une lib HTTP** : appel REST/gRPC à un service séparé
- Vous voulez **du Rust** : commencer par WebAssembly, escalader vers `napi-rs` si besoin
- Le coût de maintenance d'un addon natif est **élevé** : ne le payer que si la valeur est claire

---
layout: cover
---

# Conclusion de la formation

- Vous avez vu les fondamentaux **avancés** de Node.js
- Vous savez **profiler**, **debugger**, **scaler** une application
- Vous maîtrisez les **streams**, **événements**, **modules avancés**
- Continuez à pratiquer ! Liens utiles :
  - https://nodejs.org/api/
  - https://nodejs.org/en/learn/
  - https://github.com/goldbergyoni/nodebestpractices
