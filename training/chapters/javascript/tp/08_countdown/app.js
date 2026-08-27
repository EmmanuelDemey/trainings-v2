// Mini-project 1 - Countdown

// --- 1. State ---------------------------------------------------------------
// Everything the application knows lives here, and nowhere else.
let remaining = 0;   // seconds left
let running = false; // is the clock ticking?
let intervalId = null;

const durationInput = document.querySelector('#duration');
const formError = document.querySelector('#form-error');
const display = document.querySelector('#display');
const message = document.querySelector('#message');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const resetButton = document.querySelector('#reset');

// --- Pure logic -------------------------------------------------------------
// TODO 1: 95 -> '01:35'. Test it in the console before going further.
function formatTime(seconds) {}

// --- 2. Render --------------------------------------------------------------
// TODO 2: rebuild the WHOLE display from the state:
//   - the time, via formatTime
//   - the `danger` class on #display under 10 seconds
//   - Start disabled while running, Pause enabled only while running
//   - the Pause button reads 'Pause' or 'Resume'
function render() {}

// --- 3. Events --------------------------------------------------------------
startButton.addEventListener('click', () => {
  // TODO 8: validate the duration (a number, > 0). On error: message in
  //   #form-error, and stop here.
  // TODO 3: set the state, then start ticking.
});

pauseButton.addEventListener('click', () => {
  // TODO 5: pause if running, resume otherwise. The remaining time must not move.
});

resetButton.addEventListener('click', () => {
  // TODO 6: back to zero, stopped, no message, whatever the current state.
});

// TODO 3 & 4: two small functions, so that no handler manipulates the interval
//   directly.
function startTicking() {
  // guard against a double interval, then setInterval(tick, 1000)
}

function stopTicking() {
  // clearInterval and forget the id
}

function tick() {
  // one second less, render(), and stop at zero with a message
}

render();
