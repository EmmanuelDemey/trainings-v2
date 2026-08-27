// Acceptance criteria for TP 10.
setTimeout(() => {
  const cards = document.querySelectorAll('.card');
  const names = [...document.querySelectorAll('.card h3')].map((h) => h.textContent);

  check('the 12 cards are rendered', () => cards.length === 12);
  check('every card has an avatar with initials', () =>
    cards.length > 0 &&
    [...cards].every((card) => /^[A-ZÉÈÀ]{1,3}$/.test(card.querySelector('.avatar')?.textContent ?? '')));
  check('sorted by name by default', () => names[0] === 'Ada Lovelace');
  check('accents are collated properly (localeCompare)', () =>
    names.indexOf('Élodie Martin') < names.indexOf('Zoé Bernard'));
  check('every card has a mailto link', () =>
    cards.length > 0 && [...cards].every((card) => card.querySelector('a[href^="mailto:"]') !== null));
  check('the counter is displayed', () =>
    document.querySelector('#count').textContent.trim().length > 0);
  check('the empty message is hidden while there are results', () =>
    document.querySelector('#empty').classList.contains('hidden'));
  checkReport();
  console.log('%cthe search and the sort are checked by hand — or with npm run verify:javascript', 'color:#6b6b80');
}, 300);
