// TP 4 - The window — solution

// --- 1. What the browser knows ---------------------------------------------
// window. is implicit: `innerWidth` alone works. Writing it explicitly here
// makes it obvious where those values come from — they are the browser's, not
// the language's. Nothing in JavaScript itself knows what a viewport is.
show('viewport', `${window.innerWidth} x ${window.innerHeight}`);
show('url', location.href);
show('language', navigator.language);

console.log('viewport', window.innerWidth, window.innerHeight);
console.log('url', location.href);
console.log('language', navigator.language, '— all languages:', navigator.languages);

// --- 2. A delayed message ---------------------------------------------------
// setTimeout does not pause anything: this line returns immediately, the rest of
// the file keeps running, and the browser calls our function 2s later.
setTimeout(() => {
  show('delayed', '2 seconds have passed');
}, 2000);

// --- 3. A cancelled message -------------------------------------------------
// setTimeout returns a handle. Keeping it is the only way to cancel later — and
// the same is true of setInterval, which is where it really matters.
const cancelledId = setTimeout(() => {
  show('cancelled', 'you should never see this');
}, 5000);
clearTimeout(cancelledId);

// --- 4. A ticking timer -----------------------------------------------------
let remaining = 10;
show('countdown', remaining);

// The two mistakes this task exists for:
//   1. forgetting clearInterval — the numbers keep going, -1, -2, -3...;
//   2. clearing on `remaining === 0` BEFORE displaying it, so 0 is never shown.
const intervalId = setInterval(() => {
  remaining--;
  if (remaining === 0) {
    show('countdown', 'Liftoff!');
    clearInterval(intervalId);
    return;
  }
  show('countdown', remaining);
}, 1000);

// Note for Day 3: this counts TICKS, not time. The browser throttles intervals
// in background tabs, so after a minute in another tab this timer is late. A
// real countdown stores the target date and recomputes `target - Date.now()` on
// every tick — the interval only decides how often we refresh the display.

// --- 5. Back to top ---------------------------------------------------------
onClick('back-to-top', () => {
  scrollTo({ top: 0, behavior: 'smooth' });
});
// `behavior: 'smooth'` is ignored for users who asked for reduced motion in
// their OS — the browser does that for us. One less accessibility bug.
