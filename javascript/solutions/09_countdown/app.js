// Mini-project 1 - Countdown — solution

// --- 1. State ---------------------------------------------------------------
let remaining = 0;
let running = false;
let intervalId = null;

const durationInput = document.querySelector('#duration');
const formError = document.querySelector('#form-error');
const display = document.querySelector('#display');
const message = document.querySelector('#message');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const resetButton = document.querySelector('#reset');

// --- Pure logic -------------------------------------------------------------
// No DOM in here: it takes a number, returns a string. That is what makes it
// testable in the console, and the reason it is written first.
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

// --- 2. Render --------------------------------------------------------------
// The only function in the file allowed to write to the page. Called after every
// state change, it rebuilds EVERYTHING — it never patches "what changed".
// Slower on paper, and immune to the class of bug where two parts of the screen
// disagree because one update path forgot one of them.
function render() {
  display.textContent = formatTime(remaining);
  display.classList.toggle('danger', remaining > 0 && remaining <= 10);

  startButton.disabled = running;
  pauseButton.disabled = remaining === 0;
  pauseButton.textContent = running ? 'Pause' : 'Resume';
}

// --- 3. Events --------------------------------------------------------------
// Handlers do three things and no more: validate, change the state, render.
startButton.addEventListener('click', () => {
  formError.textContent = '';
  message.textContent = '';

  // valueAsNumber gives NaN on an empty or invalid field, where .value gives ''
  // and '' would silently become 0 through arithmetic. NaN fails every
  // comparison, so this test catches empty, letters, and negatives at once.
  const duration = durationInput.valueAsNumber;
  if (!Number.isFinite(duration) || duration <= 0) {
    formError.textContent = 'Enter a duration in seconds, greater than 0.';
    return;
  }

  remaining = Math.floor(duration);
  running = true;
  startTicking();
  render();
});

pauseButton.addEventListener('click', () => {
  if (running) {
    stopTicking();
    running = false;
  } else if (remaining > 0) {
    running = true;
    startTicking();
  }
  render();
});

resetButton.addEventListener('click', () => {
  stopTicking();
  remaining = 0;
  running = false;
  message.textContent = '';
  formError.textContent = '';
  render();
});

// Only these three functions know that setInterval exists. The day this becomes
// a requestAnimationFrame loop or a Web Worker, nothing else in the file moves.
function startTicking() {
  // THE guard of this workshop. Without it, clicking Start twice creates a
  // second interval: the clock runs twice as fast, and `intervalId` only holds
  // the last one — the first keeps running forever, unreachable.
  if (intervalId !== null) {
    return;
  }
  intervalId = setInterval(tick, 1000);
}

function stopTicking() {
  clearInterval(intervalId);
  intervalId = null; // forgetting this line breaks the guard above
}

function tick() {
  remaining--;

  if (remaining <= 0) {
    remaining = 0;
    running = false;
    stopTicking();
    message.textContent = "Time's up!";
  }

  render();
}

render(); // the first display goes through the same path as all the others

// --- Going further: the drift ----------------------------------------------
// This version counts TICKS. A background tab throttles intervals (one per
// second at best, far less after a few minutes), so a 3-minute countdown comes
// back late. The fix is to count TIME instead:
//
//   let target = Date.now() + duration * 1000;
//   function tick() {
//     remaining = Math.max(0, Math.round((target - Date.now()) / 1000));
//     ...
//   }
//
// The interval then only decides how often we REFRESH; the value displayed is
// always recomputed from a fixed point. Pausing stores the time left, resuming
// recomputes a new target. Same code size, correct in a background tab, and
// refreshing 10 times a second becomes a one-constant change.
