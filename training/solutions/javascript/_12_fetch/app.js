// TP 12 - Talking to a server — solution
//
// Served over HTTP: `npx serve solutions/javascript/12_fetch`.

const list = document.querySelector('#products');
const summary = document.querySelector('#summary');
const loading = document.querySelector('#loading');
const errorBox = document.querySelector('#error');

const euros = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });

// --- The state --------------------------------------------------------------
let state = { status: 'idle', products: [], error: null };

// --- 1. A first request -----------------------------------------------------
// Kept as a log-only chain: it is the same request the rest of the file makes
// with async/await, written the way you meet it in existing code.
fetch('data/products.json')
  .then((response) => {
    console.log('a Response, not the data:', response);
    console.log('status', response.status, '| ok', response.ok);
    return response.json(); // reading the body is asynchronous too
  })
  .then((products) => console.log('and now the data:', products))
  .catch((error) => console.error('the request itself failed:', error));

// --- 2 & 3. Render the three states -----------------------------------------
function render() {
  loading.classList.toggle('hidden', state.status !== 'loading');
  errorBox.classList.toggle('hidden', state.status !== 'error');
  errorBox.textContent = state.error ?? '';

  // replaceChildren empties and refills in one call — the render of Day 3.
  list.replaceChildren(
    ...state.products.map((product) => {
      const li = document.createElement('li');

      const name = document.createElement('span');
      name.textContent = product.name;

      const price = document.createElement('span');
      price.textContent = euros.format(product.price);

      li.append(name, price);
      return li;
    }),
  );

  if (state.status !== 'data') {
    summary.textContent = '';
    return;
  }

  const total = state.products.reduce((sum, product) => sum + product.price, 0);
  summary.textContent = state.products.length
    ? `${state.products.length} product(s), total ${euros.format(total)}`
    : 'No product';
}

// --- 4 & 5. The request, with its two failure modes --------------------------
async function loadProducts(url = 'data/products.json') {
  const response = await fetch(url);

  // fetch only rejects when the request could not be made at all. A 404 IS an
  // answer, so it fulfils — and .json() would then choke on an HTML error page.
  if (!response.ok) throw new Error(`HTTP ${response.status} on ${url}`);

  return response.json();
}

async function load(url = 'data/products.json') {
  state = { ...state, status: 'loading', error: null };
  render();

  try {
    state = { ...state, products: await loadProducts(url), status: 'data' };
  } catch (error) {
    state = { ...state, products: [], status: 'error', error: error.message };
  } finally {
    render(); // whichever branch ran, the loading line must go
  }
}

// --- 6. Retry ---------------------------------------------------------------
document.querySelector('#reload').addEventListener('click', () => load());
document.querySelector('#load-missing').addEventListener('click', () => load('data/nope.json'));

load();

// --- 7. Bonus: abort the previous request -----------------------------------
const search = document.querySelector('#search');
const searchStatus = document.querySelector('#search-status');
let inFlight = null;

search.addEventListener('input', async () => {
  const term = search.value.trim().toLowerCase();

  inFlight?.abort(); // the answer for 'ab' must never overwrite the one for 'abc'
  inFlight = new AbortController();

  try {
    const response = await fetch('data/products.json', { signal: inFlight.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();

    const matching = products.filter((product) => product.name.toLowerCase().includes(term));
    state = { ...state, products: matching, status: 'data' };
    searchStatus.textContent = `${matching.length} match(es) for "${term}"`;
    render();
  } catch (error) {
    if (error.name === 'AbortError') return; // we cancelled it: not a failure
    searchStatus.textContent = error.message;
  }
});
