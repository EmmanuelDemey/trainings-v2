// TP 12 - Talking to a server
//
// ⚠️ This workshop does NOT work by double-clicking index.html: a fetch from a
// file:// page is blocked. Serve the folder first:
//
//     npx serve chapters/javascript/tp/12_fetch
//
// The URL in the address bar must start with http://.

const list = document.querySelector('#products');
const summary = document.querySelector('#summary');
const loading = document.querySelector('#loading');
const errorBox = document.querySelector('#error');

const euros = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });

// --- The state --------------------------------------------------------------
// Three states, never two: loading, error, data.
let state = { status: 'idle', products: [], error: null };

// --- 1. A first request -----------------------------------------------------
// TODO: fetch('data/products.json') and log what the promise resolves with.
//   Log response.status and response.ok too, then chain .then((r) => r.json())
//   and log the array. Read the Network panel while you are at it.

// --- 2 & 3. Render the three states -----------------------------------------
function render() {
  // TODO: show #loading only when state.status === 'loading'
  //       show #error   only when state.status === 'error' (with state.error)
  //       fill #products from state.products: one <li> per product, with its
  //       name and its price formatted by `euros`
  //       fill #summary with "N product(s), total XX.XX €" — and say
  //       "No product" when the array is empty.
  // Hint: element.classList.toggle('hidden', condition)
}

// --- 4. A 404 is not an error ----------------------------------------------
async function loadProducts(url = 'data/products.json') {
  // TODO (step 4 + 5): rewrite the promise chain of step 1 here, with
  //   async / await:
  //     - await fetch(url)
  //     - if (!response.ok) throw new Error(`HTTP ${response.status}`)
  //     - return await response.json()
  //   Without the `ok` check, a missing file lands in .json() and crashes with
  //   an unreadable message. Try it before writing the check.
}

// --- 5. Wire it up ----------------------------------------------------------
async function load(url) {
  // TODO: set the status to 'loading' and render, then try/catch/finally:
  //   - try:     state.products = await loadProducts(url)   → status 'data'
  //   - catch:   state.error = error.message                → status 'error'
  //   - finally: render()
}

// --- 6. Retry ---------------------------------------------------------------
document.querySelector('#reload').addEventListener('click', () => {
  // TODO: load the products again.
});

document.querySelector('#load-missing').addEventListener('click', () => {
  // TODO: call load('data/nope.json') — the error state must show up in the
  //   page, not only in the console.
});

// TODO: load the products once, at startup.

// --- 7. Bonus: abort the previous request -----------------------------------
// TODO: on every input in #search, start a fetch with an AbortController and
//   abort the previous one. Ignore the AbortError in the catch: cancelling is
//   not a failure. Write what happened in #search-status.
