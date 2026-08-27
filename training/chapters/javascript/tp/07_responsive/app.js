// TP 7 - Responsive behaviour

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
// TODO: write applyLayout(): display the width, display 'mobile' or 'desktop',
//   and toggle the `mobile` class on document.body under MOBILE_BREAKPOINT.
function applyLayout() {}

// TODO: call applyLayout on every `resize`, incrementing resizeCount and
//   displaying it. Do not forget the initial call, outside of any event.

// --- 3. matchMedia ----------------------------------------------------------
// TODO: create a media query for (max-width: 767px), and listen to its `change`
//   event, incrementing mediaCount and displaying it.
//   Then compare the two counters while resizing.

// --- 4 & 5. Burger menu -----------------------------------------------------
// TODO: clicking #burger toggles the `open` class on #menu, keeps `menuOpen` in
//   sync, and updates aria-expanded.
// TODO: when leaving mobile, close the menu (step 5).

// --- 6. Reduced motion ------------------------------------------------------
// TODO: log whether the user asked for reduced motion.
//   Hint: matchMedia('(prefers-reduced-motion: reduce)').matches
