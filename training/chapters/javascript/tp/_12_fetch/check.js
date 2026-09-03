// Acceptance criteria for TP 12. The page loads over HTTP, so give the request
// a moment before checking.
setTimeout(() => {
  const items = document.querySelectorAll('#products li');

  check('the products are rendered', () => items.length === 4);
  check('a price is formatted, not raw', () =>
    items.length > 0 && /12[.,]00/.test(items[0].textContent));
  check('the loading line is hidden once the data is there', () =>
    document.querySelector('#loading').classList.contains('hidden'));
  check('the error line is hidden on the happy path', () =>
    document.querySelector('#error').classList.contains('hidden'));
  check('the summary counts and totals', () => {
    const text = document.querySelector('#summary').textContent;
    return text.includes('4') && text.includes('46');
  });
  checkReport();
  console.log('%cthe error state is checked by clicking "Load a missing file"', 'color:#6b6b80');
}, 1200);
