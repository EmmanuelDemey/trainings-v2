// TP 5 - Manipulating the page

const products = [
  { name: 'Mug', price: 12 },
  { name: 'Poster', price: 8.5 },
  { name: 'Sticker', price: 1.5 },
  { name: 'T-shirt', price: 24 },
];

// --- 1. Select and read -----------------------------------------------------
// TODO: select the <h1>, log its text, then change it to 'My store'.

// --- 2. null is the trap ----------------------------------------------------
// TODO: log document.querySelector('#nope'), then uncomment the next line,
//   read the error message, and comment it back.
// console.log(document.querySelector('#nope').textContent);

// --- 3. Count ---------------------------------------------------------------
// TODO: log how many .item the page contains, then the text of each one.

// --- 4. Show / hide ---------------------------------------------------------
const toggleButton = document.querySelector('#toggle');
const panel = document.querySelector('#panel');

onClick(toggleButton, () => {
  // TODO: toggle the `hidden` class on the panel.
});

// --- 5. An attribute --------------------------------------------------------
// TODO: make #doc-link point at https://developer.mozilla.org, opening in a new
//   tab (target="_blank" and rel="noopener").

// --- 6. Render an array -----------------------------------------------------
const list = document.querySelector('#products');

function render() {
  // TODO: for each product, create an <li> containing:
  //   - a <span> with "Name — 12.00 €"
  //   - a <button> "Remove"
  //   and append it to `list`.
  //   Then wire the button (step 7) and refresh the summary (step 8).
}

// --- 8. The summary ---------------------------------------------------------
function updateSummary() {
  // TODO: count the <li> currently in the list and sum their prices, then write
  //   "N product(s), total XX.XX €" into #summary.
  //   Hint: keep the price on the element with a data attribute
  //   (li.dataset.price = ...) so you can read it back here.
}

render();
