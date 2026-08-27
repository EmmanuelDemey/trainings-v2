# TP 10 — Mini-project 3: Staff directory

> Day 3, guided practice. ~1h15.

## Goal

A list of people, a search field, a sort dropdown. This is the project where the
**state ➜ render ➜ events** pattern really pays off: two independent controls act
on the same list, and there is still only one function drawing the screen.

## Setup

Open `index.html`. `data.js` gives you the `PEOPLE` array — 12 people, with a
`name`, a `role`, a `team` and an `email`. There is no photo: the avatar is the
initials, drawn in CSS.

## Steps

1. **The state** — three variables and no more: the search text, the sort key,
   and… that is it. The list of *displayed* people is **not** state: it is
   derived, recomputed at every render. Keeping it in a variable is how the two
   controls end up out of sync.
2. **`visiblePeople()`** — from `PEOPLE`, the search text and the sort key,
   return the array to display. Filter, then sort a **copy**. No DOM in this
   function.
3. **Search** — on the name *and* the role, case-insensitive, ignoring leading
   and trailing spaces.
4. **Sort** — by name, or by role then name. Compare strings with
   `localeCompare`, not with `<` (try `'Élodie'` against `'Emma'` with both).
5. **`createCard(person)`** — one function, one person, one `<article>` element
   returned. Initials in the avatar, name, role, team, and a `mailto:` link.
6. **`render()`** — empty the container, rebuild it from `visiblePeople()`, and
   update the counter (`12 people` / `3 results`). If the list is empty, show a
   "No result for …" message instead of an empty grid.
7. **Events** — `input` on the field, `change` on the select. Each one updates
   **one** state variable then calls `render()`. Two lines each, nothing more.
8. **Reset** — a button that clears the search and puts the sort back to
   default. It changes the state and re-renders; it must **not** touch the
   cards.
9. **Responsive** — the grid is 1 column on mobile, 2 on tablet, 3 on desktop.
   This one is pure CSS (`grid-template-columns` + `auto-fill`): note that no
   JavaScript is needed, and that chapter 7 was about the cases where it is.

## Checking your work

- Typing `dev` filters on the role, `ad` finds Ada.
- Changing the sort keeps the current search applied — this is the test that
  catches a badly-held state.
- Emptying the field brings all 12 people back.
- A search with no match shows the message, not an empty page.
- At 500px wide the cards are stacked in one column.

## Going further

- **Debounce** the search: only re-render 200ms after the last keystroke. On 12
  people it changes nothing; on 5000 rows it is the difference between usable
  and not. Reuse the `setTimeout` / `clearTimeout` pair from chapter 4.
- Highlight the matched substring in the card. Then do it **without**
  `innerHTML` — that constraint is the interesting part.
- Add a team filter as a group of checkboxes: if your `visiblePeople()` is
  written properly, it is one extra `.filter()` and one state variable.
- Keep the search in the URL (`history.replaceState` + `URLSearchParams`) so
  that a filtered view can be shared and survives a reload.
