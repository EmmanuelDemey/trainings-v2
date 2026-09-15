// Mini-project 4 - Mini social network

// --- 1. State ---------------------------------------------------------------
// TODO: one array of { id, author, text, likes, createdAt }.
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
// TODO: 'Ada Lovelace' -> 'AL'
function initials(name) {}

// TODO 3: a timestamp (ms) -> 'just now', '3 min ago', '2 h ago', '4 d ago'
function relativeTime(timestamp) {}

// --- 3. Render --------------------------------------------------------------
// TODO: build the <article class="message"> for one message, with its avatar,
//   its header, its text, and its two buttons (Like / Delete).
function createMessage(message) {}

// TODO: empty the feed, rebuild it from `messages`, show #empty-feed when the
//   array is empty, and refresh the character counter + the Publish button.
function render() {}

// --- 2, 4, 5, 6. Events -----------------------------------------------------
form.addEventListener('submit', (event) => {
  // TODO 2: validate, build the message, put it at the FRONT of the array,
  //   render, clear the text but keep the author, focus back.
});

textInput.addEventListener('input', () => {
  // TODO 6: live counter, `error` class past MAX_LENGTH, Publish disabled.
});

render();
