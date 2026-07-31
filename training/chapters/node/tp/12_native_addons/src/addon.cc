// src/addon.cc — Node-API addon (built via node-addon-api / node-gyp)
#include <napi.h>

// hello() — provided, returns a greeting string.
Napi::String Hello(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello from C++");
}

// fib(n) — heavy computation to implement.
//
// TODO: implement Fibonacci.
//   1. Read the first argument and check it is a Number:
//        if (info.Length() < 1 || !info[0].IsNumber()) {
//          Napi::TypeError::New(env, "fib(n): n must be a number")
//              .ThrowAsJavaScriptException();
//          return env.Null();
//        }
//   2. Get its value: uint32_t n = info[0].As<Napi::Number>().Uint32Value();
//   3. Compute the n-th Fibonacci number. Use the naive recursive version on
//      purpose (it is intentionally slow) so the benchmark shows a clear
//      difference against the pure-JS implementation:
//        long long fib(uint32_t n) {
//          return n < 2 ? n : fib(n - 1) + fib(n - 2);
//        }
//   4. Return it: return Napi::Number::New(env, static_cast<double>(result));
Napi::Value Fib(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // TODO: replace this stub with the real implementation (see above).
  return env.Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("hello", Napi::Function::New(env, Hello));
  // TODO: export `fib` once Fib is implemented:
  // exports.Set("fib", Napi::Function::New(env, Fib));
  return exports;
}

NODE_API_MODULE(addon, Init)
