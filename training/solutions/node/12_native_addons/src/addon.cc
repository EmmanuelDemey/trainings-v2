// src/addon.cc — Node-API addon (built via node-addon-api / node-gyp)
#include <napi.h>

// hello() — provided, returns a greeting string.
Napi::String Hello(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello from C++");
}

// The actual computation, in plain C++ — no Napi types in sight.
//
// Naive and recursive on purpose: this is the workload the benchmark measures,
// and an iterative version would return instantly and prove nothing.
static long long fib(uint32_t n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

// fib(n) — the JavaScript-facing wrapper.
//
// Everything that crosses the boundary has to be validated by hand: JavaScript
// will happily call `fib("40")`, `fib()` or `fib(-1)`, and none of that is a
// compile error on this side. An unchecked `As<Napi::Number>()` on a string is
// how a native addon segfaults the whole process — no exception, no stack, just
// a dead Node.
Napi::Value Fib(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1 || !info[0].IsNumber()) {
    Napi::TypeError::New(env, "fib(n): n must be a number")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  uint32_t n = info[0].As<Napi::Number>().Uint32Value();

  // Guard the caller against themselves: fib(60) would run for years.
  if (n > 45) {
    Napi::RangeError::New(env, "fib(n): n must be <= 45")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  long long result = fib(n);
  return Napi::Number::New(env, static_cast<double>(result));
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("hello", Napi::Function::New(env, Hello));
  exports.Set("fib", Napi::Function::New(env, Fib));
  return exports;
}

NODE_API_MODULE(addon, Init)
