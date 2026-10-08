// Mini-project 2 - Password generator

// --- 1. Data ----------------------------------------------------------------
// TODO 1: the four alphabets, as strings.
const ALPHABETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: '', // TODO
  digits: '',    // TODO
  symbols: '',   // TODO
};

// --- State ------------------------------------------------------------------
let password = '';

const lengthInput = document.querySelector('#length');
const lengthValue = document.querySelector('#length-value');
const generateButton = document.querySelector('#generate');
const optionsError = document.querySelector('#options-error');
const passwordOutput = document.querySelector('#password');
const strengthOutput = document.querySelector('#strength');
const entropyOutput = document.querySelector('#entropy');
const copyButton = document.querySelector('#copy');
const copyFeedback = document.querySelector('#copy-feedback');

// --- Pure logic (no DOM below this line, up to `render`) ---------------------
// TODO: read the ticked checkboxes and return { lowercase: true, digits: false, ... }
function readOptions() {}

// TODO 2: concatenate the selected alphabets into one string.
function buildAlphabet(options) {}

// TODO 3: one character at random from `alphabet`.
function randomChar(alphabet) {}

// TODO 4 & 5: build the password, guaranteeing at least one character per
//   selected class, then shuffle.
function generate(length, options) {}

// TODO 5: shuffle the characters of a string.
function shuffle(text) {}

// TODO 8: entropy in bits — length * log2(alphabet size).
function entropyBits(length, alphabetSize) {}

// TODO 8: 'weak' / 'medium' / 'strong' from a number of bits.
function strengthLabel(bits) {}

// --- Render -----------------------------------------------------------------
// TODO 6: display the password, the strength, the entropy, and disable Copy
//   while there is nothing to copy.
function render() {}

// --- Events -----------------------------------------------------------------
// TODO 6: the slider updates #length-value live.

generateButton.addEventListener('click', () => {
  // TODO 9: no alphabet selected, or length < 4 -> error, and no generation.
  // TODO: generate, store in the state, render.
});

copyButton.addEventListener('click', async () => {
  // TODO 7: copy to the clipboard, show 'Copied!', clear it after 2 seconds.
});

render();
