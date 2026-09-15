// Mini-project 4 - Mini social network — solution

// --- 1. State ---------------------------------------------------------------
// ONE array. Everything on screen is a picture of it — likes included. There is
// no counter living only in the DOM, no "selected" class holding information.
// If you can restore the exact screen from this array alone, the state is right.
let messages = [];

const form = document.querySelector('#post-form');
const authorInput = document.querySelector('#author');
const textInput = document.querySelector('#text');
const counter = document.querySelector('#counter');
const formError = document.querySelector('#form-error');
const publishButton = document.querySelector('#publish');
const feed = document.querySelector('#feed');
const emptyFeed = document.querySelector('#empty-feed');

const MAX_LENGTH = 280;

// --- Pure logic -------------------------------------------------------------
function initials(name) {
  return name
    .trim()
    .split(/\s+/)          // several spaces in a row must not produce empty words
    .slice(0, 2)           // 'Jean Michel Pierre Dupont' -> 'JM', not 'JMPD'
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

// A timestamp in, a string out. No DOM, no global state: this is the function
// you can check in the console with relativeTime(Date.now() - 60000).
function relativeTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
// Intl.RelativeTimeFormat does this properly, in the user's language, with the
// right plurals — worth showing once the hand-rolled version is understood.

// --- 3. Render --------------------------------------------------------------
function createMessage(message) {
  const article = document.createElement('article');
  article.className = 'message';
  // The id travels with the element. It is what lets a handler say "this
  // message", without depending on its position in the list — which changes.
  article.dataset.id = message.id;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = initials(message.author);
  avatar.setAttribute('aria-hidden', 'true');

  const body = document.createElement('div');
  body.className = 'body';

  const header = document.createElement('header');
  const author = document.createElement('span');
  author.className = 'author';
  author.textContent = message.author;
  const date = document.createElement('time');
  date.className = 'date';
  date.dateTime = new Date(message.createdAt).toISOString(); // machine-readable
  date.textContent = relativeTime(message.createdAt);
  header.append(author, date);

  const text = document.createElement('p');
  text.className = 'text';
  // THE line of step 8. textContent inserts a string, full stop: '<img ...>' is
  // shown as those characters. With innerHTML the browser would PARSE it, and
  // the onerror attribute of a broken image runs JavaScript. That is stored XSS
  // — the visitor's session, in the hands of whoever posted the message.
  text.textContent = message.text;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const likeButton = document.createElement('button');
  likeButton.type = 'button';
  likeButton.textContent = `♥ ${message.likes}`;
  likeButton.classList.toggle('liked', message.likes > 0);
  likeButton.addEventListener('click', () => like(message.id));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => remove(message.id));

  actions.append(likeButton, deleteButton);
  body.append(header, text, actions);
  article.append(avatar, body);
  return article;
}

// The only function that writes to the feed.
function render() {
  feed.textContent = '';
  messages.forEach((message) => feed.append(createMessage(message)));

  const isEmpty = messages.length === 0;
  emptyFeed.textContent = isEmpty ? 'Nothing here yet — publish the first message!' : '';

  renderCounter();
}

// Split out because two different events need it: typing, and publishing (which
// empties the field and must put the counter back to 0).
function renderCounter() {
  const { length } = textInput.value;
  counter.textContent = `${length} / ${MAX_LENGTH}`;
  counter.classList.toggle('error', length > MAX_LENGTH);
  publishButton.disabled = length === 0 || length > MAX_LENGTH;
}

// --- 2, 4, 5. Actions -------------------------------------------------------
// Each one does the same two things: change the array, re-render. They know
// nothing about buttons or classes.
function like(id) {
  messages = messages.map((message) =>
    message.id === id ? { ...message, likes: message.likes + 1 } : message,
  );
  render();
}
// A new object rather than `message.likes++` on the existing one: same result
// here, and the habit that makes the day you move to React or Vue a non-event —
// both of them detect a change by comparing references.
//
// What we are NOT doing: `likeButton.textContent = '♥ ' + (n + 1)`. It works,
// it is faster, and it puts a number on the screen that exists nowhere in the
// state. Re-render, and it is gone.

function remove(id) {
  messages = messages.filter((message) => message.id !== id);
  render();
}
// filter by id, not by index. Indexes shift as soon as something is removed
// above, so a handler that captured `index` deletes the wrong message. The id
// stays true whatever happens to the list.

// --- Events -----------------------------------------------------------------
form.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.textContent = '';

  const author = authorInput.value.trim();
  const text = textInput.value.trim();

  if (author === '') {
    formError.textContent = 'A name is required.';
    return;
  }
  if (text === '') {
    formError.textContent = 'The message is empty.';
    return;
  }
  if (text.length > MAX_LENGTH) {
    formError.textContent = `Maximum ${MAX_LENGTH} characters.`;
    return;
  }

  const message = {
    id: crypto.randomUUID(),
    author,
    text,
    likes: 0,
    createdAt: Date.now(), // a number, not a Date: it survives JSON round-trips
  };

  // unshift adds at the FRONT — newest first, without ever sorting.
  // The alternative, messages.push() + a sort by createdAt descending in
  // render(), is more robust if messages ever arrive out of order (from a
  // server, say). Here, unshift says the intent in one word.
  messages.unshift(message);

  // Clear the text, keep the author: nobody wants to retype their name for
  // every message. Small detail, and the difference between a demo and a usable
  // interface.
  textInput.value = '';
  render();
  textInput.focus();
});

textInput.addEventListener('input', renderCounter);

render();

// --- Going further: persistence ---------------------------------------------
// const STORAGE_KEY = 'mini-social-messages';
//
// function save() {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
// }
//
// function load() {
//   messages = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
// }
//
// Call load() before the first render(), and save() at the end of like(),
// remove() and the submit handler. Two things to know: localStorage only stores
// STRINGS, and JSON.parse on null throws — hence the `?? '[]'`. This is also why
// createdAt is a number: a Date goes through JSON.stringify as a string and
// comes back as a string, not a Date.
