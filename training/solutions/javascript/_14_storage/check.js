// Acceptance criteria for TP 14.
//
// All red on the very first load is normal: add a task, then reload.
setTimeout(() => {
  let stored = null;
  let raw = null;
  try {
    raw = localStorage.getItem('trainings.todos.v1');
    stored = JSON.parse(raw);
  } catch (error) {
    console.warn('the stored value is not valid JSON:', raw);
  }

  const rendered = document.querySelectorAll('#todos li').length;

  check('the page is served over http (not file://)', () =>
    location.protocol.startsWith('http'));
  check('the list is stored under trainings.todos.v1', () => raw !== null);
  check('it was stringified, not concatenated', () => Array.isArray(stored));
  check('every stored task has an id, a text and a done flag', () =>
    Array.isArray(stored) &&
    stored.every((todo) => todo && 'id' in todo && 'text' in todo && 'done' in todo));
  check('the page shows exactly what is stored (reload to be sure)', () =>
    Array.isArray(stored) && stored.length === rendered);
  check('the empty message follows the list', () =>
    document.querySelector('#empty').classList.contains('hidden') === rendered > 0);
  checkReport();
  console.log('%cadd a task then reload — the draft and the Clear button are checked by hand', 'color:#6b6b80');
}, 300);
