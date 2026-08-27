// Acceptance criteria for TP 5.
setTimeout(() => {
  const products = document.querySelectorAll('#products li');

  check('the title was changed', () => document.querySelector('h1').textContent === 'My store');
  check('the 4 products are rendered', () => products.length === 4);
  check('each line has a Remove button', () =>
    products.length > 0 && [...products].every((li) => li.querySelector('button') !== null));
  check('each line has a <span> label (createElement, not innerHTML)', () =>
    products.length > 0 && [...products].every((li) => li.querySelector('span') !== null));
  check('the panel is hidden at startup', () =>
    document.querySelector('#panel').classList.contains('hidden'));
  check('the summary counts and totals', () => {
    const summary = document.querySelector('#summary').textContent;
    return summary.includes('4') && summary.includes('46');
  });
  check('the documentation link points at MDN', () =>
    document.querySelector('#doc-link').href.includes('developer.mozilla.org'));
  checkReport();
  console.log('%cthe Details button and the Remove buttons are checked by hand', 'color:#6b6b80');
}, 300);
