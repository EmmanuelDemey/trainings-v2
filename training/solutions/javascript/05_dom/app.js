// TP 5 - Manipulating the page — solution

const products = [
  { name: 'Mug', price: 12 },
  { name: 'Poster', price: 8.5 },
  { name: 'Sticker', price: 1.5 },
  { name: 'T-shirt', price: 24 },
];

// --- 1. Select and read -----------------------------------------------------
// querySelector takes the CSS selectors everybody already knows. There is no
// second API to learn: 'h1', '#panel', '.item', 'ul > li:first-child' all work.
const title = document.querySelector('h1');
console.log('The title says:', title.textContent);
title.textContent = 'My store';

// --- 2. null is the trap ----------------------------------------------------
// No match is not an error, it is null. The crash comes one line later, when we
// read a property of null: "Cannot read properties of null (reading
// 'textContent')". Nine times out of ten the cause is a typo in the selector,
// or a script running before the element exists — which is what `defer` fixes.
console.log(document.querySelector('#nope')); // null
// console.log(document.querySelector('#nope').textContent); // TypeError

// --- 3. Count ---------------------------------------------------------------
const items = document.querySelectorAll('.item');
console.log(`${items.length} items in the page`);
items.forEach((item) => console.log('-', item.textContent));
// querySelectorAll returns a NodeList: it has forEach and works with for...of,
// but it has no map/filter. `[...items]` turns it into a real array when needed.

// --- 4. Show / hide ---------------------------------------------------------
const toggleButton = document.querySelector('#toggle');
const panel = document.querySelector('#panel');

onClick(toggleButton, () => {
  // The appearance stays in the CSS (.hidden { display: none }), the logic stays
  // in JS. Never write panel.style.display = 'none' — that hardcodes a design
  // decision in the wrong file, and it fights every stylesheet you own.
  panel.classList.toggle('hidden');
});

// --- 5. An attribute --------------------------------------------------------
const docLink = document.querySelector('#doc-link');
docLink.href = 'https://developer.mozilla.org';
docLink.target = '_blank';
docLink.rel = 'noopener'; // without it, the opened page can reach back via window.opener
// docLink.setAttribute('href', ...) does the same for standard attributes.
// setAttribute is only mandatory for non-standard ones (aria-*, data-*, custom).

// --- 6 & 7. Render an array, and remove -------------------------------------
const list = document.querySelector('#products');

function render() {
  // Empty first, so calling render() twice does not duplicate everything.
  list.textContent = '';

  products.forEach((product) => {
    const li = document.createElement('li');
    // dataset writes a data-price="12" attribute. It is the standard place to
    // park a value you will need to read back off the element later (step 8).
    li.dataset.price = product.price;

    const label = document.createElement('span');
    label.textContent = `${product.name} — ${product.price.toFixed(2)} €`;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    onClick(removeButton, () => {
      li.remove();      // removes the whole line, not just the button
      updateSummary();  // the display must never contradict itself
    });

    // append accepts several children at once, and accepts strings too.
    li.append(label, ' ', removeButton);
    list.append(li);
  });

  updateSummary();
}

// Note the closure: each `removeButton` handler remembers ITS OWN `li`, because
// `li` is declared with const inside the forEach callback — one binding per
// iteration. Written with `var` in a classic for loop, all four buttons would
// remove the last line. That bug is why `let`/`const` exist.

// --- 8. The summary ---------------------------------------------------------
// One function, called from render() and from every removal. The alternative —
// recomputing the total inline in both places — is the duplication that makes
// the two displays disagree the day one of them is updated and not the other.
function updateSummary() {
  const lines = list.querySelectorAll('li');
  const total = [...lines].reduce((sum, li) => sum + Number(li.dataset.price), 0);
  const summary = document.querySelector('#summary');
  summary.textContent = `${lines.length} product(s), total ${total.toFixed(2)} €`;
}

render();

// Reading the state back OUT of the DOM, as updateSummary does here, is the
// pragmatic choice for a workshop of this size — and it is exactly what Day 3
// stops doing. There, the array is the truth and the DOM is only its picture:
// remove from the array, re-render, and there is no second copy to keep in sync.
