// TP 6 - Interactive interfaces

// --- 1. Counter -------------------------------------------------------------
const decrementButton = document.querySelector('#decrement');
const incrementButton = document.querySelector('#increment');
const resetButton = document.querySelector('#reset');
const countOutput = document.querySelector('#count');

let count = 0;

// TODO: write a render() that displays `count` and disables the "-" button
//   when count is 0.
function renderCount() {}

// TODO: wire the three buttons. Each one changes `count`, then calls renderCount().

// --- 6. Add / remove a listener ---------------------------------------------
// TODO: this function must be added as a `click` listener on the "+" button,
//   and removed when the "Mute the console" checkbox is ticked.
//   It is a NAMED function on purpose: an inline arrow cannot be removed.
function logCount() {
  console.log('count is now', count);
}

// --- 2. Character counter ---------------------------------------------------
const bio = document.querySelector('#bio');
const bioCounter = document.querySelector('#bio-counter');
const MAX_LENGTH = 100;

// TODO: on every keystroke, display "12 / 100" and add the `error` class to the
//   counter past MAX_LENGTH (remove it below).
//   Try `change` instead of `input` once, to feel the difference.

// --- 3. Sign-up form --------------------------------------------------------
const signupForm = document.querySelector('#signup');

// TODO: on submit:
//   - preventDefault()
//   - reset the two error messages
//   - "Name is required" if the name is empty (trim() it)
//   - "Invalid email" if the email does not contain '@'
//   - if everything is valid: a success message and form.reset()

// --- 4. Todo-list -----------------------------------------------------------
const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');
const todoError = document.querySelector('#todo-error');

// TODO: on submit, add an <li> containing the text and a "Delete" button.
//   - an empty task shows an error and adds nothing
//   - clicking the text toggles the `done` class
//   - clicking "Delete" removes the line
//   - after each add: clear the field and give it the focus back
//
// TODO 7 (delegation): do it with ONE listener on todoList, not two per task.
//   Inside it: event.target tells you what was clicked, and
//   event.target.closest('li') gives you the row it belongs to.

// --- 5. Keyboard ------------------------------------------------------------
// TODO: pressing Escape anywhere in the document clears #todo-input.
//   Hint: the `keydown` event, and event.key === 'Escape'.
