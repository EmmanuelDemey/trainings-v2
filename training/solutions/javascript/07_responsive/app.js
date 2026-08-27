// TP 7 - Responsive behaviour — solution

const MOBILE_BREAKPOINT = 768;

const widthOutput = document.querySelector('#width');
const modeOutput = document.querySelector('#mode');
const resizeCountOutput = document.querySelector('#resize-count');
const mediaCountOutput = document.querySelector('#media-count');
const burger = document.querySelector('#burger');
const menu = document.querySelector('#menu');

let resizeCount = 0;
let mediaCount = 0;
let menuOpen = false;

// --- 1 & 2. resize ----------------------------------------------------------
// One function that puts the page in the right state for the current size, and
// that can be called at any moment. Not "what changed", but "what should it look
// like now" — the same idea as the render() of Day 3.
function applyLayout() {
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

  widthOutput.textContent = window.innerWidth;
  modeOutput.textContent = isMobile ? 'mobile' : 'desktop';
  document.body.classList.toggle('mobile', isMobile);

  // Step 5: leaving mobile must close the menu, otherwise `open` stays on the
  // <ul>, invisible on desktop, and the menu appears to reopen by itself the
  // next time the window narrows.
  if (!isMobile && menuOpen) {
    closeMenu();
  }
}

window.addEventListener('resize', () => {
  resizeCount++;
  resizeCountOutput.textContent = resizeCount;
  applyLayout();
});

// THE line everybody forgets. Without it the page is only correct after the
// first resize — so it is correct on the trainer's machine, who resizes, and
// wrong for the user, who does not.
applyLayout();

// --- 3. matchMedia ----------------------------------------------------------
// Same query as the CSS, written once, read by both. `mobileQuery.matches` is a
// boolean available immediately — no need to wait for an event to know the
// current state.
const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

mobileQuery.addEventListener('change', (event) => {
  mediaCount++;
  mediaCountOutput.textContent = mediaCount;
  console.log('breakpoint crossed — mobile:', event.matches);
});

// Why one counter explodes and the other does not: `resize` reports EVERY pixel
// of the drag — hundreds of events, each running our handler. `matchMedia`
// reports a state CHANGE: it fires twice for a full trip across 768px, whatever
// the path. Same result, two orders of magnitude fewer handler calls, and one
// single source of truth shared with the CSS.
//
// Note the 767px in the query, against `< 768` in applyLayout: `max-width: 768px`
// would INCLUDE 768 and put the two rules one pixel out of step. Off-by-one at
// the breakpoint is a real bug, and it is always this one.

// --- 4 & 5. Burger menu -----------------------------------------------------
burger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  renderMenu();
});

function closeMenu() {
  menuOpen = false;
  renderMenu();
}

function renderMenu() {
  menu.classList.toggle('open', menuOpen);
  // aria-expanded is what tells a screen reader that this button controls
  // something, and whether that something is currently open. Two lines, and the
  // menu goes from unusable to usable without a mouse.
  burger.setAttribute('aria-expanded', String(menuOpen));
}

renderMenu();

// --- 6. Reduced motion ------------------------------------------------------
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
console.log('reduced motion requested:', reducedMotion.matches);

// Use it to decide a behaviour, not only a style:
//   scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
// matchMedia reads any media query — width, orientation, prefers-color-scheme,
// pointer: coarse. It is the general bridge between CSS conditions and JS
// behaviour, not just a width helper.
