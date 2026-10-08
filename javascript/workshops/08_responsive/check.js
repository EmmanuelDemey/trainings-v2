// Acceptance criteria for TP 8. Resize the window to re-run them.
function runChecks() {
  const isMobile = window.innerWidth < 768;

  check('the viewport width is displayed', () =>
    Number(document.querySelector('#width').textContent) === window.innerWidth);
  check('the mode matches the width', () =>
    document.querySelector('#mode').textContent.trim() === (isMobile ? 'mobile' : 'desktop'));
  check('the `mobile` class on <body> matches the width', () =>
    document.body.classList.contains('mobile') === isMobile);
  check('the menu is not left open outside mobile', () =>
    isMobile || !document.querySelector('#menu').classList.contains('open'));
  checkReport();
  console.log('%cnow resize across 768px and compare the two counters', 'color:#6b6b80');
}

setTimeout(runChecks, 300);
