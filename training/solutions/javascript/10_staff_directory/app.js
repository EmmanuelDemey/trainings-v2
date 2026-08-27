// Mini-project 3 - Staff directory — solution
// PEOPLE comes from data.js.

// --- 1. State ---------------------------------------------------------------
// Two variables. The displayed list is deliberately NOT stored: it is derived
// from these two at every render. Keeping a `filteredPeople` variable around is
// exactly how the sort ends up dropping the search — two copies of the truth,
// updated by two different handlers, one of which will forget.
let search = '';
let sortKey = 'name';

const searchInput = document.querySelector('#search');
const sortSelect = document.querySelector('#sort');
const resetButton = document.querySelector('#reset');
const countOutput = document.querySelector('#count');
const emptyMessage = document.querySelector('#empty');
const grid = document.querySelector('#grid');

// --- 2, 3, 4. Derived data (no DOM in here) ---------------------------------
function visiblePeople() {
  const needle = search.trim().toLowerCase();

  return PEOPLE
    .filter((person) => matches(person, needle))
    // [...] first: sort() mutates, and PEOPLE is our source of truth. Sorting it
    // in place would permanently reorder the data behind the display.
    .sort(compareBy(sortKey));
}
// filter BEFORE sort, not after: we sort fewer items. On 12 people it is
// invisible; the habit is what matters.

function matches(person, needle) {
  if (needle === '') {
    return true; // an empty search excludes nobody
  }
  // Lowercase on both sides — otherwise 'ada' finds nothing.
  return (
    person.name.toLowerCase().includes(needle) ||
    person.role.toLowerCase().includes(needle)
  );
}

// Returns a comparator: the sort key is chosen once, not tested on every pair.
function compareBy(key) {
  if (key === 'role') {
    // Two levels: role, then name inside a role. `||` works because
    // localeCompare returns 0 for equal strings, which is falsy.
    return (a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name);
  }
  return (a, b) => a.name.localeCompare(b.name);
}
// localeCompare and not `a.name < b.name`: `<` compares code points, so 'Élodie'
// lands AFTER 'Zoé' — accented letters sit above 'Z' in Unicode. localeCompare
// applies the language's collation rules and puts 'Élodie' next to 'Emma', which
// is what a French reader expects. Same reasoning for case.

function initials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

// --- 5. One card ------------------------------------------------------------
// One person in, one element out. No append to the page here: the function
// builds, the caller decides where it goes. That is what makes it reusable.
function createCard(person) {
  const card = document.createElement('article');
  card.className = 'card';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = initials(person.name);
  // Decorative: the name is right next to it, a screen reader should not read
  // "AL" out loud as if it were information.
  avatar.setAttribute('aria-hidden', 'true');

  const body = document.createElement('div');

  const name = document.createElement('h3');
  name.textContent = person.name;

  const role = document.createElement('p');
  role.textContent = `${person.role} · ${person.team}`;

  const mail = document.createElement('a');
  mail.href = `mailto:${person.email}`;
  mail.textContent = person.email;

  body.append(name, role, mail);
  card.append(avatar, body);
  return card;
}
// textContent everywhere, so a name containing '<' or '&' is displayed, never
// interpreted. With innerHTML and a template string this card would be an XSS
// hole the day the data comes from a server.

// --- 6. Render --------------------------------------------------------------
// The only function that writes to the page.
function render() {
  const people = visiblePeople();

  // Empty first. textContent = '' is the shortest correct way, and it drops the
  // old listeners along with the old elements.
  grid.textContent = '';
  people.forEach((person) => grid.append(createCard(person)));

  countOutput.textContent =
    people.length === PEOPLE.length
      ? `${PEOPLE.length} people`
      : `${people.length} result(s) out of ${PEOPLE.length}`;

  // An empty grid with no message reads as a bug. Say what happened, and echo
  // what was searched for.
  const isEmpty = people.length === 0;
  emptyMessage.textContent = isEmpty ? `No result for “${search.trim()}”.` : '';
  emptyMessage.classList.toggle('hidden', !isEmpty);
}
// Rebuilding all 12 cards on every keystroke is fine here — the DOM is fast, and
// the code stays trivially correct. At a few thousand rows you would keep the
// elements and only move them, which is precisely the job React & co. do for
// you. Knowing where that line is matters more than crossing it early.

// --- 7 & 8. Events ----------------------------------------------------------
// Each handler does exactly two things: change ONE state variable, re-render.
// No handler knows what a card looks like.
searchInput.addEventListener('input', (event) => {
  search = event.target.value;
  render();
});

sortSelect.addEventListener('change', (event) => {
  sortKey = event.target.value;
  render();
});
// Because the sort handler only touches `sortKey`, the current search survives
// it for free. That property is the whole point of the pattern.

resetButton.addEventListener('click', () => {
  search = '';
  sortKey = 'name';
  // The form controls are the one exception: they hold their own value, so they
  // have to be put back in sync with the state explicitly.
  searchInput.value = '';
  sortSelect.value = 'name';
  render();
});

render();

// --- Going further: debounce ------------------------------------------------
// let debounceId;
// searchInput.addEventListener('input', (event) => {
//   search = event.target.value;
//   clearTimeout(debounceId);
//   debounceId = setTimeout(render, 200);
// });
// The state updates immediately, the expensive part (the render) waits for the
// typing to stop. Same two functions as chapter 4, put to real use.
