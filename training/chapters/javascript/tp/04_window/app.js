// TP 4 - The window
// show(id, text) and onClick(id, handler) are given by ui.js.

// --- 1. What the browser knows ---------------------------------------------
// TODO: display the viewport size as "1280 x 800".
//   Hint: window.innerWidth and window.innerHeight.
show('viewport', '-');

// TODO: display the current URL.
//   Hint: location.href

// TODO: display the browser language.
//   Hint: navigator.language

// --- 2. A delayed message ---------------------------------------------------
// TODO: after 2 seconds, show('delayed', '2 seconds have passed').

// --- 3. A cancelled message -------------------------------------------------
// TODO: schedule a message on #cancelled in 5 seconds, keep the returned id,
//   then cancel it right away with clearTimeout. Nothing must change on screen.

// --- 4. A ticking timer -----------------------------------------------------
// TODO: count down from 10 to 0, one step per second, with setInterval.
//   Display each value with show('countdown', ...).
//   At 0: display 'Liftoff!' and STOP the interval with clearInterval.
let remaining = 10;

// --- 5. Back to top ---------------------------------------------------------
onClick('back-to-top', () => {
  // TODO: scroll back to the top of the page, smoothly.
  //   Hint: scrollTo({ top: ..., behavior: ... })
});
