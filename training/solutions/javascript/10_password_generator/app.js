// Mini-project 2 - Password generator — solution

// --- 1. Data ----------------------------------------------------------------
// Data first. Adding an alphabet later means adding a line here and a checkbox
// in the HTML — no other code changes. That is the test of a good data shape.
const ALPHABETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
};
// Deliberately no I/l/O/0 filtering: it helps a human read the password aloud,
// and it costs entropy. Worth discussing, not worth doing silently.

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
// Everything here takes values and returns values. It can be called from the
// console, and it is the part that would be unit-tested in a real project.
function readOptions() {
  return {
    lowercase: document.querySelector('#lowercase').checked,
    uppercase: document.querySelector('#uppercase').checked,
    digits: document.querySelector('#digits').checked,
    symbols: document.querySelector('#symbols').checked,
  };
}

// Object.keys(ALPHABETS) rather than a hardcoded list: the loop follows the data.
function selectedKeys(options) {
  return Object.keys(ALPHABETS).filter((key) => options[key]);
}

function buildAlphabet(options) {
  return selectedKeys(options)
    .map((key) => ALPHABETS[key])
    .join('');
}

// The single point of randomness in the whole file. Everything else is
// deterministic — which is why swapping it for crypto (see the end) is a
// four-line change.
function randomChar(alphabet) {
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

// --- 4 & 5. Generation ------------------------------------------------------
function generate(length, options) {
  const keys = selectedKeys(options);
  const alphabet = buildAlphabet(options);

  // One guaranteed character per selected class...
  const required = keys.map((key) => randomChar(ALPHABETS[key]));

  // ...and the rest drawn from the whole alphabet.
  const rest = Array.from({ length: length - required.length }, () =>
    randomChar(alphabet),
  );

  // The shuffle is not decoration. Without it the guaranteed characters always
  // sit at the front, in the same class order — a password that always starts
  // with a lowercase then an uppercase then a digit. That is a pattern an
  // attacker can exploit: it removes real entropy, silently.
  // And this is also why we do NOT "overwrite the first three characters" of an
  // already-generated password: the positions would be fixed, same problem.
  return shuffle([...required, ...rest].join(''));
}

// Fisher-Yates: walk from the end, swap each item with one drawn among those
// not yet placed. Every permutation is equally likely.
// Do NOT use `.sort(() => Math.random() - 0.5)`: it looks clever, it is biased,
// and the bias depends on the browser's sort implementation.
function shuffle(text) {
  const characters = [...text];
  for (let i = characters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }
  return characters.join('');
}

// --- 8. Strength ------------------------------------------------------------
// Entropy = how many guesses an attacker needs, expressed in bits. Each extra
// bit doubles that number. It is the only honest measure here: it depends on the
// length AND on the size of the alphabet, which is exactly what the options do.
function entropyBits(length, alphabetSize) {
  return Math.round(length * Math.log2(alphabetSize));
}

function strengthLabel(bits) {
  if (bits < 50) return 'weak';
  if (bits < 80) return 'medium';
  return 'strong';
}
// The thresholds are conventions, not physics: ~50 bits is within reach of a
// well-funded offline attack, ~80 is comfortable today. Counting ticked
// checkboxes instead — what most sites' "strength meters" do — rates
// "Password1!" strong. It is not.

// --- Render -----------------------------------------------------------------
function render() {
  const options = readOptions();
  const alphabet = buildAlphabet(options);

  passwordOutput.textContent = password || '—';

  if (password === '') {
    strengthOutput.textContent = '—';
    strengthOutput.className = '';
    entropyOutput.textContent = '';
  } else {
    const bits = entropyBits(password.length, alphabet.length);
    const label = strengthLabel(bits);
    strengthOutput.textContent = label;
    strengthOutput.className = label; // the CSS class carries the colour
    entropyOutput.textContent = `(~${bits} bits, alphabet of ${alphabet.length})`;
  }

  copyButton.disabled = password === '';
}

// --- Events -----------------------------------------------------------------
// `input` and not `change`: the number must follow the thumb while dragging.
lengthInput.addEventListener('input', () => {
  lengthValue.textContent = lengthInput.value;
});

generateButton.addEventListener('click', () => {
  optionsError.textContent = '';
  copyFeedback.textContent = '';

  const options = readOptions();
  const alphabet = buildAlphabet(options);
  const length = lengthInput.valueAsNumber;

  if (alphabet === '') {
    optionsError.textContent = 'Select at least one character class.';
    return;
  }
  if (length < 4) {
    optionsError.textContent = 'Length must be at least 4.';
    return;
  }
  // A guard worth having: at length 3 with four classes ticked, `rest` would
  // have a negative length and Array.from would silently return an empty array,
  // producing a password longer than asked. Validate before generating.
  if (length < selectedKeys(options).length) {
    optionsError.textContent = 'Length is smaller than the number of classes.';
    return;
  }

  password = generate(length, options);
  render();
});

copyButton.addEventListener('click', async () => {
  try {
    // Asynchronous, and it can be refused: no permission, or a page not served
    // over https / localhost. Opening index.html from file:// may well land you
    // in the catch — which is the point of having one.
    await navigator.clipboard.writeText(password);
    copyFeedback.textContent = 'Copied!';
  } catch (error) {
    copyFeedback.textContent = 'Copy refused by the browser';
    console.error(error);
  }
  setTimeout(() => {
    copyFeedback.textContent = '';
  }, 2000);
});

render();

// --- Going further: real randomness ----------------------------------------
// Math.random() is a fast PRNG with a small internal state. It is not seeded
// unpredictably and its output is not meant to resist analysis — for a password
// it is the wrong tool. The browser ships the right one:
//
//   function randomChar(alphabet) {
//     const draw = new Uint32Array(1);
//     crypto.getRandomValues(draw);
//     return alphabet[draw[0] % alphabet.length];
//   }
//
// Note that `% alphabet.length` introduces a modulo bias whenever the alphabet
// size does not divide 2**32 — small here, real in principle. The clean fix is
// rejection sampling: redraw when the value falls in the last, incomplete block.
