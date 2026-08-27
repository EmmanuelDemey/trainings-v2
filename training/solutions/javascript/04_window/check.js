// Acceptance criteria for TP 4. Runs 3 seconds after load, then again at 12s.
setTimeout(() => {
  const text = (id) => document.getElementById(id).textContent.trim();

  check('the viewport size is displayed', () => /^\d+\s*x\s*\d+$/.test(text('viewport')));
  check('the URL is displayed', () => text('url').includes('index.html'));
  check('the language is displayed', () => text('language').length > 1 && text('language') !== '-');
  check('the delayed message fired', () => text('delayed') !== 'waiting...');
  check('the cancelled timeout never fired', () => text('cancelled') === 'this text must never change');
  check('the countdown is ticking', () => {
    const value = Number(text('countdown'));
    return value > 5 && value < 10;
  });
  checkReport();
  console.log('%cthe last check runs at ~12s — leave the page open', 'color:#6b6b80');
}, 3000);

setTimeout(() => {
  check('the countdown reached Liftoff and stopped', () =>
    document.getElementById('countdown').textContent.trim() === 'Liftoff!');
  checkReport();
}, 12500);
