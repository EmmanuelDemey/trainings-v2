---
layout: cover
---

# 9 - Talking to a server

<div style="opacity: 0.75; font-size: 0.9em">Optional module — ~2h with its workshop</div>

---

# Where the data comes from

- Until now every array was **written in the file**. In a real page it comes
  from a **server**, over HTTP

```
GET https://api.example.com/products     ← the request, sent by the browser

200 OK                                   ← the response: a status…
Content-Type: application/json
[{ "name": "Mug", "price": 12 }, ...]    ← …and a body, almost always JSON
```

- **JSON** is text that looks like a JavaScript object literal, with two rules:
  keys in double quotes, no trailing comma, no functions and no comments

```javascript
JSON.parse('{"name":"Ada"}');     // text  ➜ object
JSON.stringify({ name: 'Ada' });  // object ➜ text
```

> Open the **Network** panel of the devtools on any site: every line is one
> request, with its status, its size, and its response body.

---

# The browser does not wait

- A request takes 50 ms on a good day, 5 s on a train. JavaScript **does not
  block** while it waits — it goes on running

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);   // scheduled, not run now
console.log('3');

// 1, 3, 2
```

- You already met this in chapter 4: `setTimeout` runs **later**
- Same model for a request: you describe **what to do when the answer arrives**
- The value is not there **yet** — so a function cannot `return` it

```javascript
const data = fetch('/products');   // ❌ not the products: a Promise
```

---

# A promise

- An object that stands for **a value that is not available yet**
- Three states: **pending** ➜ **fulfilled** (a value) or **rejected** (an error)

```javascript
fetch('/products')                      // pending…
  .then((response) => response.json())  // …fulfilled: run this
  .then((products) => console.log(products))
  .catch((error) => console.error('failed:', error));
```

- `.then(fn)` — "when it works, run `fn` with the value"
- `.catch(fn)` — "if anything above failed, run `fn` with the error"
- Each `.then` returns a **new promise**: that is why they chain

> Every asynchronous browser API returns a promise today. Learn the shape once.

---

# `fetch` — the request

```javascript
const response = fetch('data/products.json');
```

- One argument: the **URL**. Relative to the page, exactly like `src` in HTML
- The promise resolves with a **`Response`**, not with your data:

```javascript
fetch('data/products.json')
  .then((response) => response.json())   // reads the body, returns a promise too
  .then((products) => render(products));
```

- `response.json()` parses the body as JSON — `response.text()` for plain text
- `response.status` (200, 404, 500…), `response.ok` (`true` under 400)

> The body is **streamed**: it has not arrived yet when the headers have. That
> is why reading it is itself asynchronous.

---

# The trap: a 404 is not an error

```javascript
fetch('data/nope.json')
  .then((response) => response.json())   // 💥 crashes on the HTML error page
  .catch((error) => console.error(error));
```

- `fetch` **rejects only** when the request could not be made at all: no
  network, DNS failure, CORS blocked
- A server answering `404` or `500` answered — the promise **fulfills**
- So check `ok` yourself, every time:

```javascript
fetch('data/products.json')
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(render)
  .catch((error) => showError(error.message));
```

---

# `async` / `await`

- The same promises, read **top to bottom**

```javascript
async function loadProducts() {
  const response = await fetch('data/products.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const products = await response.json();
  return products;                    // an async function returns a PROMISE
}

loadProducts()
  .then(render)
  .catch((error) => showError(error.message));
```

- `await` = "wait for this promise, give me the value"
- Only inside a function marked `async` (or at the top level of a **module**)
- **`await` does not freeze the page** — the rest of the app keeps running

---

# `try` / `catch`

- With `await`, errors come back as plain exceptions

```javascript
async function show() {
  showLoading(true);
  try {
    const products = await loadProducts();
    render(products);
  } catch (error) {
    showError(error.message);         // network down, 404, malformed JSON
  } finally {
    showLoading(false);               // runs in both cases — always
  }
}
```

- `try` the risky part, `catch` the failure, `finally` what must happen anyway
- Calling an `async` function **without** `await`, `.then` or `.catch` hides the
  error in an "unhandled rejection" — the console still tells you

---

# A screen has three states

- Never two: **loading**, **error**, **data**. The state pattern of Day 3, with
  one field added

```javascript
let state = { status: 'loading', products: [], error: null };

function render() {
  loader.classList.toggle('hidden', state.status !== 'loading');
  errorBox.classList.toggle('hidden', state.status !== 'error');
  errorBox.textContent = state.error ?? '';
  list.replaceChildren(...state.products.map(toListItem));
}
```

- Show the loading state **before** the request, not after
- An error is a **state**, not a `console.error`: the user must see it
- Empty (`[]`) is a fourth case, and it is not an error

---

# Sending data

```javascript
await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ author: 'Ada', text: 'hello' }),
});
```

- `method`: `GET` (default), `POST`, `PUT`, `PATCH`, `DELETE`
- `body` is a **string** — `JSON.stringify` it, and say so in the headers
- A form can go as-is: `body: new FormData(form)` (no `Content-Type` then)

> A `GET` reads, everything else writes. A button that writes must be disabled
> while the request is in flight, or a double-click posts twice.

---

# Cancelling, and giving up

```javascript
const controller = new AbortController();

fetch(url, { signal: controller.signal })
  .catch((error) => {
    if (error.name === 'AbortError') return;   // we cancelled: not a failure
    showError(error.message);
  });

controller.abort();                            // typing again, leaving the page

fetch(url, { signal: AbortSignal.timeout(5000) }); // give up after 5 s
```

- A search box fires one request per keystroke: **abort the previous one**, or
  an old answer overwrites a newer one

---

# Why your `fetch` fails locally

- Opening `index.html` by **double-click** gives a `file://` page. A `fetch`
  from there is blocked, whatever the file

```bash
npx serve chapters/javascript/tp/12_fetch     # then open the printed http://…
```

- On a real site: the browser blocks a response from **another origin** unless
  that server sends `Access-Control-Allow-Origin`. That is **CORS**, and it is
  the *server's* decision — nothing in your JavaScript fixes it
- `TypeError: Failed to fetch` + a CORS line in the console = that case

---

# Hands-on

## Workshop 12 - Talking to a server

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/12_fetch/</code> — ⏱ ~1h15 — <b>run it with <code>npx serve</code></b>, steps in its <code>README.md</code></div>

- Load a JSON file with `fetch` and render it as a list
- Handle the three states: loading, error, data
- Rewrite the whole thing with `async` / `await` and `try` / `catch`
- Check `response.ok` and make a 404 show a readable message
- Bonus: a *Retry* button, and a search box that aborts its previous request
