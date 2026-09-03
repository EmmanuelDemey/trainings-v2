// TP 13 - Splitting an application — solution
//
// This file is now only about the page: what it shows, and what the user does.
// The formatting lives in format.js, the data in store.js, one element in
// cart-item.js.
import { price, plural } from './format.js';
import { getItems, addItem, total } from './store.js';
import createItem from './cart-item.js';

const list = document.querySelector('#items');
const totalLine = document.querySelector('#total');
const form = document.querySelector('#add-form');

function render() {
  list.replaceChildren(...getItems().map((item) => createItem(item, render)));
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
// import(...) is a function call: it can live inside a handler, and it returns
// a promise. stats.js is downloaded on the first click, then cached like any
// other module — a second click fetches nothing.
document.querySelector('#stats').addEventListener('click', async () => {
  const { summary } = await import('./stats.js');
  document.querySelector('#stats-output').textContent = summary(getItems());
});

render();
