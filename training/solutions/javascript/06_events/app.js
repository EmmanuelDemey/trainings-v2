// TP 6 - Interactive interfaces — solution

// --- 1. Counter -------------------------------------------------------------
const decrementButton = document.querySelector('#decrement');
const incrementButton = document.querySelector('#increment');
const resetButton = document.querySelector('#reset');
const countOutput = document.querySelector('#count');

// The count lives in a variable. The page only DISPLAYS it.
// Reading the number back from the text (Number(countOutput.textContent)) works
// until the day the display gains a unit, a space or a translation. The state is
// the truth, the DOM is its picture — this is the Day 3 pattern, starting here.
let count = 0;

function renderCount() {
  countOutput.textContent = count;
  // Disabling is better than hiding: the button stays where it is, the layout
  // does not jump, and screen readers announce it as unavailable.
  decrementButton.disabled = count === 0;
}

// Every handler does the same two things: change the state, then re-render.
incrementButton.addEventListener('click', () => {
  count++;
  renderCount();
});

decrementButton.addEventListener('click', () => {
  count--;
  renderCount();
});

resetButton.addEventListener('click', () => {
  count = 0;
  renderCount();
});

renderCount(); // the initial display comes from the same function — no duplication

// --- 6. Add / remove a listener ---------------------------------------------
function logCount() {
  console.log('count is now', count);
}

incrementButton.addEventListener('click', logCount);

// removeEventListener matches on the SAME function reference — which is why
// logCount is a named function declared once, and not an inline arrow. With
// `addEventListener('click', () => console.log(count))` there would be nothing
// to pass here, and the listener could never be removed: the most common leak
// in a page that lives for a while.
document.querySelector('#mute').addEventListener('change', (event) => {
  if (event.target.checked) {
    incrementButton.removeEventListener('click', logCount);
  } else {
    incrementButton.addEventListener('click', logCount);
  }
});
// Adding the same reference twice is harmless: the browser ignores the
// duplicate. Adding two different arrows that do the same thing is not.

// --- 2. Character counter ---------------------------------------------------
const bio = document.querySelector('#bio');
const bioCounter = document.querySelector('#bio-counter');
const MAX_LENGTH = 100;

bio.addEventListener('input', (event) => {
  const { length } = event.target.value;
  bioCounter.textContent = `${length} / ${MAX_LENGTH}`;
  // toggle(class, condition) instead of an if/else: one line, and impossible to
  // forget the "remove" branch.
  bioCounter.classList.toggle('error', length > MAX_LENGTH);
});
// `input` fires on every keystroke, and also on paste, drag-and-drop, undo and
// autofill. `change` fires only when the field loses focus — for a live counter
// it looks broken. For an expensive action (a network call) `change`, or a
// debounced `input`, is the right choice.

// --- 3. Sign-up form --------------------------------------------------------
const signupForm = document.querySelector('#signup');
const nameError = document.querySelector('#name-error');
const emailError = document.querySelector('#email-error');
const signupSuccess = document.querySelector('#signup-success');

signupForm.addEventListener('submit', (event) => {
  // Without this line the page reloads and everything we do next is lost.
  // The number one "my JavaScript does nothing" question of every training.
  event.preventDefault();

  nameError.textContent = '';
  emailError.textContent = '';
  signupSuccess.textContent = '';

  const name = signupForm.querySelector('#name').value.trim();
  const email = signupForm.querySelector('#email').value.trim();
  let valid = true;

  // trim() first: a field with three spaces in it is empty, as far as a user is
  // concerned.
  if (name === '') {
    nameError.textContent = 'Name is required';
    valid = false;
  }

  // Deliberately naive. Do NOT write an email regex: the real grammar (RFC 5322)
  // is unreasonable, and every homemade regex rejects a valid address sooner or
  // later. In production: <input type="email"> for the shape, and a confirmation
  // link for the truth.
  if (!email.includes('@')) {
    emailError.textContent = 'Invalid email';
    valid = false;
  }

  // We do not return early on the first error: the user should see ALL the
  // problems at once, not discover them one reload at a time.
  if (!valid) {
    return;
  }

  signupSuccess.textContent = `Welcome ${name}!`;
  signupForm.reset();
});

// --- 4. Todo-list -----------------------------------------------------------
const todoForm = document.querySelector('#todo-form');
const todoInput = document.querySelector('#todo-input');
const todoList = document.querySelector('#todo-list');
const todoError = document.querySelector('#todo-error');

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  todoError.textContent = '';

  const text = todoInput.value.trim();
  if (text === '') {
    todoError.textContent = 'A task cannot be empty';
    return;
  }

  todoList.append(createTask(text));

  todoInput.value = '';
  // Giving the focus back is what makes a form usable at the keyboard: type,
  // Enter, type, Enter — without ever touching the mouse.
  todoInput.focus();
});

// One task = one function, and it only BUILDS — it wires nothing.
// It stays testable, and the day tasks come from a server instead of the field,
// only the caller changes.
function createTask(text) {
  const li = document.createElement('li');

  const label = document.createElement('span');
  label.textContent = text;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';

  li.append(label, deleteButton);
  return li;
}

// --- 7. Delegation ----------------------------------------------------------
// ONE listener, on the parent, registered once — instead of two per task.
// It works because a click bubbles: it fires on the <span>, then on the <li>,
// then on this <ul>, then up to document.
//
// Three properties you get for free:
//   1. it keeps working on tasks added AFTERWARDS — nothing to wire on creation;
//   2. 500 rows cost one listener, not 1000;
//   3. removing a row leaks nothing, because nothing was attached to it.
todoList.addEventListener('click', (event) => {
  // event.target = what was actually clicked (the <span>, the <button>...).
  // event.currentTarget = what is listening — always this <ul>.
  const row = event.target.closest('li');
  if (row === null) {
    return; // clicked the padding of the <ul>, not a row
  }

  if (event.target.matches('button')) {
    row.remove();
    return;
  }
  if (event.target.matches('span')) {
    event.target.classList.toggle('done');
  }
});

// --- 5. Keyboard ------------------------------------------------------------
// On `document`, because a key press is not aimed at any particular element.
// The event still bubbles up from wherever the focus is.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    todoInput.value = '';
  }
});
// event.key holds the character or the name of the key ('a', 'Enter', 'Escape',
// 'ArrowLeft'). Use it, not the deprecated event.keyCode.
