// Given helper — you will write this yourself in chapter 5.
// show('viewport', '1280 x 800') puts the text inside the element with id="viewport".
function show(id, text) {
  document.getElementById(id).textContent = text;
}

// Given helper — you will write this yourself in chapter 6.
// onClick('back-to-top', fn) runs fn when that button is clicked.
function onClick(id, handler) {
  document.getElementById(id).addEventListener('click', handler);
}

// Makes the page long enough to scroll.
document.getElementById('filler').insertAdjacentHTML(
  'beforeend',
  '<p>&nbsp;</p>'.repeat(40),
);
