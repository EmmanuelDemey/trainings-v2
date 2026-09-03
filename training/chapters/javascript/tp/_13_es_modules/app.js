// TP 13 - Splitting an application
//
// ⚠️ A module is fetched, so file:// refuses it. Serve the folder first:
//
//     npx serve chapters/javascript/tp/13_es_modules
//
// Everything below works as it is. Steps 2 to 5 ask you to move pieces of it
// into format.js, store.js and cart-item.js, and to import them back here.

// --- MOVE TO format.js (step 2) ---------------------------------------------
const CURRENCY = 'EUR';

function price(amount) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: CURRENCY }).format(amount);
}

function plural(count, word) {
  return `${count} ${word}${count > 1 ? 's' : ''}`;
}

// --- MOVE TO store.js (step 3) ----------------------------------------------
let items = [
  { id: 'i1', name: 'Mug', price: 12 },
  { id: 'i2', name: 'Poster', price: 8.5 },
];

function getItems() {
  return items;
}

function addItem(name, amount) {
  items = [...items, { id: crypto.randomUUID(), name, price: amount }];
}

function removeItem(id) {
  items = items.filter((item) => item.id !== id);
}

function total() {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// --- MOVE TO cart-item.js, as a DEFAULT export (step 5) ----------------------
function createItem(item) {
  const li = document.createElement('li');

  const label = document.createElement('span');
  label.textContent = `${item.name} — ${price(item.price)}`;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => {
    removeItem(item.id);
    render();
  });

  li.append(label, remove);
  return li;
}

// --- STAYS HERE: the page ----------------------------------------------------
const list = document.querySelector('#items');
const totalLine = document.querySelector('#total');
const form = document.querySelector('#add-form');

function render() {
  list.replaceChildren(...getItems().map(createItem));
  totalLine.textContent = `${plural(getItems().length, 'item')}, total ${price(total())}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.querySelector('#name');
  const amount = document.querySelector('#price');
  if (!name.value.trim()) return;

  addItem(name.value.trim(), Number(amount.value));
  form.reset();
  name.focus();
  render();
});

// --- 6. Load a module on demand ---------------------------------------------
document.querySelector('#stats').addEventListener('click', async () => {
  // TODO: import ./stats.js dynamically and call its `summary(getItems())`,
  //   writing the result into #stats-output. Watch the Network panel: stats.js
  //   is only downloaded on the first click.
  document.querySelector('#stats-output').textContent = 'not wired yet';
});

render();
