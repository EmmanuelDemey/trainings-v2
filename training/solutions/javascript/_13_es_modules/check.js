// Acceptance criteria for TP 13.
setTimeout(() => {
  const loaded = performance
    .getEntriesByType('resource')
    .map((entry) => entry.name.split('?')[0]);
  const isLoaded = (file) => loaded.some((name) => name.endsWith(`/${file}`));

  check('the page is served over http (not file://)', () =>
    location.protocol.startsWith('http'));
  check('app.js is loaded as a module', () =>
    document.querySelector('script[type="module"]') !== null);
  check('format.js is imported', () => isLoaded('format.js'));
  check('store.js is imported', () => isLoaded('store.js'));
  check('cart-item.js is imported', () => isLoaded('cart-item.js'));
  check('stats.js is NOT loaded before the click', () => !isLoaded('stats.js'));
  // NB: `window.price` is NOT a good probe — an element with id="price" already
  // puts itself there. Named ids leak into window; module scope does not.
  check('nothing leaked into window', () =>
    typeof window.plural === 'undefined' && typeof window.getItems === 'undefined');
  check('the cart still renders its 2 items', () =>
    document.querySelectorAll('#items li').length === 2);
  check('the total is formatted', () =>
    /20[.,]50/.test(document.querySelector('#total').textContent));
  checkReport();
  console.log('%cthe Add / Remove buttons and the Statistics button are checked by hand', 'color:#6b6b80');
}, 400);
