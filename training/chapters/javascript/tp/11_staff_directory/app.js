// Mini-project 3 - Staff directory
// PEOPLE comes from data.js.

// --- 1. State ---------------------------------------------------------------
// TODO: two variables only. The displayed list is NOT state.
let search = '';
let sortKey = 'name';

const searchInput = document.querySelector('#search');
const sortSelect = document.querySelector('#sort');
const resetButton = document.querySelector('#reset');
const countOutput = document.querySelector('#count');
const emptyMessage = document.querySelector('#empty');
const grid = document.querySelector('#grid');

// --- 2, 3, 4. Derived data (no DOM in here) ---------------------------------
// TODO: return the people to display, filtered by `search` then sorted by
//   `sortKey`. Sort a COPY. Compare strings with localeCompare.
function visiblePeople() {}

// TODO: 'Ada Lovelace' -> 'AL'
function initials(name) {}

// --- 5. One card ------------------------------------------------------------
// TODO: build and return the <article class="card"> for one person:
//   <div class="avatar">AL</div>, an <h3> with the name, a <p> with
//   "Role · Team", and a mailto: link.
function createCard(person) {}

// --- 6. Render --------------------------------------------------------------
// TODO: empty the grid, rebuild it, update #count, and show #empty when there
//   is no result.
function render() {}

// --- 7 & 8. Events ----------------------------------------------------------
// TODO: `input` on the field, `change` on the select, `click` on Reset.
//   Each handler: update the state, then render(). Nothing else.

render();
