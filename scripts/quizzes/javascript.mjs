// The JavaScript theory-recall questions, one set per workshop.
//
// The Advanced Vue.js chapters end with their own quiz slides, which are parsed
// straight out of the deck (see ./index.mjs). The JavaScript deck has none, so
// its questions are written here — each one recalls the chapter the workshop
// follows, and several are the traps chapter 8 warns about by name.
//
// Same shape as a parsed slide: a prompt, an optional snippet, four options, the
// letter of the right one, and why it is the right one.

/** @type {Record<string, Array<object>>} keyed by workshop folder */
export default {
  // Chapter 1 — Introduction
  '01_introduction': [
    {
      prompt: 'What does `defer` change on a `<script>` tag?',
      options: [
        { letter: 'A', text: 'The script is downloaded only when something needs it' },
        { letter: 'B', text: 'The script runs after the HTML has been fully parsed' },
        { letter: 'C', text: 'The script is delayed by a fixed 200 ms' },
        { letter: 'D', text: 'The script runs in a separate thread' },
      ],
      answer: 'B',
      explanation:
        'The browser parses the whole document first, so the elements your code touches already exist when it runs.',
    },
    {
      code: {
        language: 'javascript',
        source:
          "const languages = [{ name: 'JavaScript' }];\nconsole.log(languages.lenght.toFixed(2));\n// Uncaught TypeError: Cannot read properties of undefined (reading 'toFixed')",
      },
      prompt: 'Where is the bug?',
      options: [
        { letter: 'A', text: '`toFixed` was called without its argument' },
        { letter: 'B', text: '`languages` is an array, and arrays have no `toFixed`' },
        { letter: 'C', text: 'The typo `lenght`: it reads as `undefined`, and the error accuses the value **before** the dot' },
        { letter: 'D', text: '`console.log` cannot print a number' },
      ],
      answer: 'C',
      explanation:
        '"Cannot read properties of X" always accuses the value before the dot. `languages.lenght` is `undefined` — the typo is the real bug, one line earlier than the error suggests.',
    },
    {
      prompt: 'Which devtools panel lets you freeze the page and inspect every variable at that exact moment?',
      options: [
        { letter: 'A', text: 'Elements' },
        { letter: 'B', text: 'Console' },
        { letter: 'C', text: 'Sources' },
        { letter: 'D', text: 'Network' },
      ],
      answer: 'C',
      explanation:
        'A breakpoint in Sources pauses execution: the Scope pane lists every variable, and the console still works in the paused context.',
    },
    {
      prompt: 'Paused on a breakpoint, what does **F10** do?',
      options: [
        { letter: 'A', text: 'Resume until the next breakpoint' },
        { letter: 'B', text: 'Step over — run the line and stay in this function' },
        { letter: 'C', text: 'Step into the function being called' },
        { letter: 'D', text: 'Stop debugging and reload' },
      ],
      answer: 'B',
      explanation: 'F8 resumes, F10 steps over, F11 steps into.',
    },
  ],

  // Chapter 2 — Mental model
  '02_mental_model': [
    {
      code: {
        language: 'javascript',
        source: "const user = { name: 'Ada' };\nconst admin = user;\nadmin.name = 'Grace';\nconsole.log(user.name);",
      },
      prompt: 'What is logged?',
      options: [
        { letter: 'A', text: "`'Ada'`" },
        { letter: 'B', text: "`'Grace'`" },
        { letter: 'C', text: '`undefined`' },
        { letter: 'D', text: 'A `TypeError`, because `user` is `const`' },
      ],
      answer: 'B',
      explanation:
        '`admin` and `user` are two wires pointing at the **same** object. `const` protects the wire, not the object it points at.',
    },
    {
      prompt: 'Why is `{} === {}` false?',
      options: [
        { letter: 'A', text: 'They are compared property by property, and the comparison fails on empty objects' },
        { letter: 'B', text: '`===` does not work on objects at all' },
        { letter: 'C', text: 'They are two different objects — on objects, equality means identity' },
        { letter: 'D', text: "Because `typeof {}` is `'object'`, and objects are never equal" },
      ],
      answer: 'C',
      explanation:
        'Two objects are equal only if they are the same object: `const a = {}; a === a` is `true`. The literal `{}` creates a new one each time.',
    },
    {
      prompt: 'Which of these values is **truthy**?',
      options: [
        { letter: 'A', text: "`''`" },
        { letter: 'B', text: '`0`' },
        { letter: 'C', text: '`[]`' },
        { letter: 'D', text: '`NaN`' },
      ],
      answer: 'C',
      explanation:
        "The falsy values are exactly `false`, `0`, `''`, `null`, `undefined` and `NaN`. Everything else is truthy — `[]`, `{}` and `'0'` included.",
    },
    {
      prompt: 'On an object with no `email` property, what do `user.email` and then `user.email.length` give?',
      options: [
        { letter: 'A', text: 'Both throw a `TypeError`' },
        { letter: 'B', text: '`undefined`, then a `TypeError`' },
        { letter: 'C', text: '`null`, then `null`' },
        { letter: 'D', text: '`undefined`, then `undefined`' },
      ],
      answer: 'B',
      explanation:
        'Reading a missing property gives `undefined`; reading a property **of** `undefined` throws. `user.email?.length` returns `undefined` without crashing.',
    },
  ],

  // Chapter 3 — JS syntax
  '03_syntax': [
    {
      code: { language: 'javascript', source: "const user = { name: 'Ada' };\nuser.name = 'Grace';" },
      prompt: 'What happens on the second line?',
      options: [
        { letter: 'A', text: '`TypeError: Assignment to constant variable`' },
        { letter: 'B', text: 'Nothing — `const` protects the wire, not the object' },
        { letter: 'C', text: 'The object is silently frozen and the assignment is ignored' },
        { letter: 'D', text: '`user` becomes `undefined`' },
      ],
      answer: 'B',
      explanation:
        '`const` forbids moving the wire (`user = ...`), not mutating the object it points at. That is why `const` is the default choice.',
    },
    {
      prompt: 'What does `[10, 9, 100].sort()` return?',
      options: [
        { letter: 'A', text: '`[9, 10, 100]`' },
        { letter: 'B', text: '`[10, 100, 9]`' },
        { letter: 'C', text: '`[100, 10, 9]`' },
        { letter: 'D', text: '`[10, 9, 100]`, unchanged' },
      ],
      answer: 'B',
      explanation:
        "Without a comparator, `sort` compares the **string** forms: `'10' < '100' < '9'`. Pass one: `sort((a, b) => a - b)`.",
    },
    {
      prompt: 'Which of these **modifies** the array it is called on?',
      options: [
        { letter: 'A', text: '`map`' },
        { letter: 'B', text: '`filter`' },
        { letter: 'C', text: '`sort`' },
        { letter: 'D', text: '`find`' },
      ],
      answer: 'C',
      explanation:
        '`map` and `filter` return a new array and leave the source alone; `sort` sorts in place. Copy first — `[...prices].sort(...)` — or use `toSorted()`.',
    },
    {
      code: { language: 'javascript', source: 'function add(a, b) { a + b; }\nconsole.log(add(2, 3));' },
      prompt: 'What is logged?',
      options: [
        { letter: 'A', text: '`5`' },
        { letter: 'B', text: '`undefined`' },
        { letter: 'C', text: '`NaN`' },
        { letter: 'D', text: "`'23'`" },
      ],
      answer: 'B',
      explanation: 'There is no `return`. A function that returns nothing returns `undefined`.',
    },
    {
      code: {
        language: 'javascript',
        source:
          "const a = { likes: 0 };\nconst b = { ...a };\nb.likes = 5;\nconsole.log(a.likes);",
      },
      prompt: 'What is logged?',
      options: [
        { letter: 'A', text: '`5`' },
        { letter: 'B', text: '`0`' },
        { letter: 'C', text: '`undefined`' },
        { letter: 'D', text: '`TypeError`, `a` is a `const`' },
      ],
      answer: 'B',
      explanation:
        '`{ ...a }` builds a **new** object with the same properties. Writing to `b` cannot reach `a`. With `const b = a;` the answer would be `5` — same object, two names.',
    },
    {
      code: {
        language: 'javascript',
        source:
          "const items = [{ id: 1, done: false }, { id: 2, done: false }];\n// mark item 2 as done, WITHOUT touching `items`",
      },
      prompt: 'Which line does it?',
      options: [
        { letter: 'A', text: '`items.find((i) => i.id === 2).done = true;`' },
        { letter: 'B', text: '`items[1].done = true;`' },
        {
          letter: 'C',
          text: '`items.map((i) => (i.id === 2 ? { ...i, done: true } : i));`',
        },
        { letter: 'D', text: '`items.filter((i) => i.id === 2).done = true;`' },
      ],
      answer: 'C',
      explanation:
        'A and B write into the original objects. C rebuilds the array and replaces only the matching item with a copy — the update pattern of Day 3.',
    },
    {
      prompt: 'What does `const { role = \'none\' } = { name: \'Ada\', role: \'\' };` give `role`?',
      options: [
        { letter: 'A', text: "`'none'`" },
        { letter: 'B', text: "`''`" },
        { letter: 'C', text: '`undefined`' },
        { letter: 'D', text: 'a `SyntaxError`' },
      ],
      answer: 'B',
      explanation:
        'A destructuring default fires only on `undefined` — a missing key. An empty string is a value, so it wins. Use `||` if you want to replace the falsy ones too.',
    },
  ],

  // Chapter 4 — The window
  '04_window': [
    {
      prompt: 'What does the delay passed to `setTimeout` guarantee?',
      options: [
        { letter: 'A', text: 'That the function runs exactly then, to the millisecond' },
        { letter: 'B', text: 'A minimum: not before, but possibly well after' },
        { letter: 'C', text: 'A maximum: at the latest then' },
        { letter: 'D', text: 'Nothing at all — the delay is only a hint the browser ignores' },
      ],
      answer: 'B',
      explanation:
        'The function is queued and runs once the current code is done. `setTimeout(fn, 0)` means "as soon as possible, but after this".',
    },
    {
      code: {
        language: 'javascript',
        source: 'let remaining = 60;\nsetInterval(() => { remaining--; render(); }, 1000);',
      },
      prompt: 'Why is this countdown late after a minute in a background tab?',
      options: [
        { letter: 'A', text: '`setInterval` is less accurate than `setTimeout`' },
        { letter: 'B', text: 'It counts **ticks**, and a background tab throttles them' },
        { letter: 'C', text: '`remaining` is not reactive, so `render()` sees a stale value' },
        { letter: 'D', text: '1000 ms is too short an interval for a browser to honour' },
      ],
      answer: 'B',
      explanation:
        'Keep a fixed target — `Date.now() + 60_000` — and recompute the remaining time on every tick. The interval then only decides how often you refresh the display.',
    },
    {
      prompt: 'What does `Date.now()` return?',
      options: [
        { letter: 'A', text: 'A `Date` object' },
        { letter: 'B', text: 'A date formatted for the current locale' },
        { letter: 'C', text: 'The number of milliseconds since 1 January 1970 UTC' },
        { letter: 'D', text: 'The number of seconds since the page loaded' },
      ],
      answer: 'C',
      explanation:
        'A date is really a number. Subtract two of them for a duration in ms, divide by 1000 for seconds — and format only at display time.',
    },
    {
      prompt: 'You start an interval and never call `clearInterval`. What happens?',
      options: [
        { letter: 'A', text: 'It stops when the function that started it returns' },
        { letter: 'B', text: 'It stops on its own after a hundred iterations' },
        { letter: 'C', text: 'It keeps running in the background, for as long as the page is open' },
        { letter: 'D', text: 'The browser stops it after thirty seconds' },
      ],
      answer: 'C',
      explanation: 'Keep the id it returns and stop it. Two `setInterval` on one variable is trap number 3 of Day 3.',
    },
  ],

  // Chapter 5 — The DOM
  '05_dom': [
    {
      prompt: 'What does `document.querySelector(\'#nope\')` return when nothing matches?',
      options: [
        { letter: 'A', text: 'It throws — the selector matched nothing' },
        { letter: 'B', text: '`null`' },
        { letter: 'C', text: 'An empty NodeList' },
        { letter: 'D', text: '`undefined`' },
      ],
      answer: 'B',
      explanation:
        'No match is not an error. The crash comes on the **next** line, when you use the result — which is why the second debugging question is always "is my selector matching?".',
    },
    {
      prompt: 'Why prefer `textContent` over `innerHTML` to display text?',
      options: [
        { letter: 'A', text: 'It is shorter to type' },
        { letter: 'B', text: '`innerHTML` parses the string as HTML, so user data becomes an XSS injection' },
        { letter: 'C', text: '`innerHTML` does not exist on every element' },
        { letter: 'D', text: '`textContent` also updates the element’s CSS' },
      ],
      answer: 'B',
      explanation:
        'A message posted by a user can run code. `createElement` + `textContent` is three lines longer and cannot be exploited.',
    },
    {
      prompt: 'How should JavaScript change how an element looks?',
      options: [
        { letter: 'A', text: 'Set `element.style` property by property' },
        { letter: 'B', text: 'Add, remove or toggle a CSS class with `classList`' },
        { letter: 'C', text: 'Rewrite the page’s `<style>` tag' },
        { letter: 'D', text: 'Reload the page with a different stylesheet' },
      ],
      answer: 'B',
      explanation: 'The appearance stays in the CSS, the logic stays in the JavaScript.',
    },
    {
      prompt: 'What does `querySelectorAll` return?',
      options: [
        { letter: 'A', text: 'A real array, with every array method' },
        { letter: 'B', text: 'The first matching element' },
        { letter: 'C', text: 'A NodeList, iterable with `forEach` and `for...of`' },
        { letter: 'D', text: '`null` when several elements match' },
      ],
      answer: 'C',
      explanation:
        'A NodeList, not an array. `querySelector` is the one that returns a single element — or `null`.',
    },
  ],

  // Chapter 6 — Event-driven programming
  '06_events': [
    {
      prompt: 'Why can a listener written as an inline arrow function never be removed?',
      options: [
        { letter: 'A', text: 'Arrow functions are not allowed as listeners' },
        { letter: 'B', text: '`removeEventListener` needs the **same reference**, and an inline arrow creates a new function every time' },
        { letter: 'C', text: 'It can be removed, but only after it has fired once' },
        { letter: 'D', text: 'Arrow functions bind `this` to `window`, which breaks the removal' },
      ],
      answer: 'B',
      explanation:
        'Give the function a name, or use `{ once: true }` and let the browser remove it for you.',
    },
    {
      prompt: 'A form is submitted, the page reloads and everything is lost. What is missing?',
      options: [
        { letter: 'A', text: '`event.stopPropagation()`' },
        { letter: 'B', text: '`event.preventDefault()` in the `submit` handler' },
        { letter: 'C', text: 'A `type="button"` on the submit button' },
        { letter: 'D', text: 'An `action` attribute on the `<form>`' },
      ],
      answer: 'B',
      explanation:
        'Submitting has a default behaviour: send the form and reload. `preventDefault()` stops it so you can handle the data yourself. This is error number 1 of Day 3.',
    },
    {
      prompt: 'What is the difference between `event.target` and `event.currentTarget`?',
      options: [
        { letter: 'A', text: 'There is none — they are aliases' },
        { letter: 'B', text: '`target` is what was clicked, `currentTarget` is what listens' },
        { letter: 'C', text: '`target` is the parent, `currentTarget` is the child' },
        { letter: 'D', text: '`currentTarget` only exists on `document`' },
      ],
      answer: 'B',
      explanation:
        'An event bubbles from the element up to `document`: `target` is where it started, `currentTarget` is the element whose listener is currently running.',
    },
    {
      prompt: 'Rows added to a list after page load do not respond to clicks. What fixes it?',
      options: [
        { letter: 'A', text: 'Attaching the listener inside a `setTimeout`, so the rows exist by then' },
        { letter: 'B', text: 'One listener on the parent, and `event.target.closest(\'li\')` to find the row' },
        { letter: 'C', text: 'Calling `event.stopPropagation()` on each row' },
        { letter: 'D', text: 'Replacing `addEventListener` with an `onclick` attribute' },
      ],
      answer: 'B',
      explanation:
        'Delegation: because events bubble, a single listener on the parent catches clicks on rows that did not exist when the page loaded.',
    },
  ],

  // Chapter 7 — JavaScript and responsive design
  '07_responsive': [
    {
      prompt: 'When should JavaScript take over from CSS media queries?',
      options: [
        { letter: 'A', text: 'Always — JavaScript measures the viewport more precisely' },
        { letter: 'B', text: 'When the **behaviour** has to change, not just the style' },
        { letter: 'C', text: 'Never — anything responsive belongs in CSS' },
        { letter: 'D', text: 'Only below 768 px' },
      ],
      answer: 'B',
      explanation:
        'CSS stays the primary tool. JavaScript steps in to swap a menu for a burger, load a different component, or enable drag & drop only on desktop.',
    },
    {
      code: { language: 'javascript', source: "window.addEventListener('resize', updateLayout);" },
      prompt: 'The layout is wrong until the user resizes the window for the first time. Why?',
      options: [
        { letter: 'A', text: '`resize` does not fire on a page that was never resized — the initial `updateLayout()` call is missing' },
        { letter: 'B', text: 'The listener has to be registered on `document`, not `window`' },
        { letter: 'C', text: '`resize` needs `{ passive: true }` to fire' },
        { letter: 'D', text: '`window.innerWidth` is `0` before the first paint' },
      ],
      answer: 'A',
      explanation:
        'The handler only ever runs on a change. Call it once at startup too — this is error number 7 of Day 3.',
    },
    {
      prompt: 'What does the second argument of `classList.toggle(\'mobile\', condition)` do?',
      options: [
        { letter: 'A', text: 'Nothing — `toggle` ignores anything after the class name' },
        { letter: 'B', text: 'Adds the class when the condition is true, removes it otherwise' },
        { letter: 'C', text: 'Flips the class and returns the condition' },
        { letter: 'D', text: 'Throws when the class is absent' },
      ],
      answer: 'B',
      explanation: 'It turns a flip into a set/unset, which is what you want when a boolean drives the class.',
    },
    {
      prompt: 'What does `matchMedia` give you that the `resize` event does not?',
      options: [
        { letter: 'A', text: 'A callback on every pixel of resize, for smoother updates' },
        { letter: 'B', text: 'Notification **only** when the breakpoint is crossed, from the same query string as the CSS' },
        { letter: 'C', text: 'Responsive behaviour without any JavaScript' },
        { letter: 'D', text: 'A replacement for CSS media queries' },
      ],
      answer: 'B',
      explanation:
        '`resize` fires constantly and you filter it yourself; `matchMedia(\'(max-width: 767px)\')` fires on `change` only — and the query is the one already in your stylesheet.',
    },
  ],

  // Chapter 8 — Guided practice, project 1
  '08_countdown': [
    {
      prompt: 'In the state ➜ render ➜ events pattern, where does the truth live?',
      options: [
        { letter: 'A', text: 'In the DOM — it is what the user actually sees' },
        { letter: 'B', text: 'In the state; the DOM is only a picture of it' },
        { letter: 'C', text: 'In both, kept in sync by each handler' },
        { letter: 'D', text: 'In `localStorage`, so a reload keeps it' },
      ],
      answer: 'B',
      explanation:
        'The test: could you rebuild the whole screen from your state alone? If not, something on screen is information that lives nowhere else.',
    },
    {
      prompt: 'The user clicks **Start** twice. What is the classic bug?',
      options: [
        { letter: 'A', text: 'Nothing — the browser ignores the second call' },
        { letter: 'B', text: 'Two intervals run against one variable: the clock ticks twice as fast, and only one of them can ever be stopped' },
        { letter: 'C', text: 'The countdown silently restarts from the beginning' },
        { letter: 'D', text: 'The second interval replaces the first' },
      ],
      answer: 'B',
      explanation:
        'Guard the handler, or `clearInterval` the previous id before starting a new one.',
    },
    {
      prompt: 'What does `String(7).padStart(2, \'0\')` return?',
      options: [
        { letter: 'A', text: "`'07'`" },
        { letter: 'B', text: "`'70'`" },
        { letter: 'C', text: '`7`' },
        { letter: 'D', text: "`'7'`, because the string is already shorter than 2" },
      ],
      answer: 'A',
      explanation: 'It pads on the left up to the requested length — the `mm:ss` display of the countdown.',
    },
    {
      prompt: 'What should an event handler do, in this pattern?',
      options: [
        { letter: 'A', text: 'Read the DOM, compute the new display, and write it back' },
        { letter: 'B', text: 'Change one piece of state, then call `render()`' },
        { letter: 'C', text: 'Everything about its feature, so the logic stays in one place' },
        { letter: 'D', text: 'Call `render()` first, then update the state' },
      ],
      answer: 'B',
      explanation:
        'Two lines each. A handler that grows is logic that belongs in a function — and a handler never knows what a card looks like.',
    },
  ],

  // Chapter 8 — Guided practice, project 2
  '09_password_generator': [
    {
      prompt: 'What does `Math.random()` return?',
      options: [
        { letter: 'A', text: 'An integer, 0 or 1' },
        { letter: 'B', text: 'A decimal in `[0, 1[` — never exactly 1' },
        { letter: 'C', text: 'A decimal in `]0, 1]` — never exactly 0' },
        { letter: 'D', text: 'A cryptographically secure random number' },
      ],
      answer: 'B',
      explanation:
        'Fine for a game or a demo. For a real password or a token it is the wrong tool — reach for `crypto.getRandomValues()`.',
    },
    {
      prompt: 'How do you pick one random item out of `fruits`?',
      options: [
        { letter: 'A', text: '`fruits[Math.random() * fruits.length]`' },
        { letter: 'B', text: '`fruits[Math.floor(Math.random() * fruits.length)]`' },
        { letter: 'C', text: '`fruits[Math.round(Math.random() * fruits.length)]`' },
        { letter: 'D', text: '`fruits.random()`' },
      ],
      answer: 'B',
      explanation:
        'An index must be a whole number, so `Math.floor`. `Math.round` would occasionally produce `fruits.length` itself — one past the end.',
    },
    {
      prompt: 'Forcing "at least one digit" by overwriting the first character of the password — what does it cost?',
      options: [
        { letter: 'A', text: 'One character of length' },
        { letter: 'B', text: 'It puts every character class at a fixed position, and quietly destroys the randomness' },
        { letter: 'C', text: 'Nothing — it is the standard technique' },
        { letter: 'D', text: 'It throws when the requested length is 1' },
      ],
      answer: 'B',
      explanation:
        'An attacker who knows the generator knows position 0 is always a digit. Draw the required characters, then shuffle the whole result.',
    },
    {
      prompt: 'What does `(12.3456).toFixed(2)` return?',
      options: [
        { letter: 'A', text: 'The number `12.35`' },
        { letter: 'B', text: "The string `'12.35'`" },
        { letter: 'C', text: 'The number `12.34`' },
        { letter: 'D', text: "The string `'12.34'`" },
      ],
      answer: 'B',
      explanation:
        '`toFixed` rounds and returns a **string** — for display only. `Number(\'42\')` goes the other way.',
    },
  ],

  // Chapter 8 — Guided practice, project 3
  '10_staff_directory': [
    {
      prompt: 'A search field and a sort dropdown. Where should the filtered list live?',
      options: [
        { letter: 'A', text: 'In a variable holding the filtered array, updated by each handler' },
        { letter: 'B', text: 'Nowhere — a pure function recomputes it from the state on every render' },
        { letter: 'C', text: 'In the DOM, read back when the sort changes' },
        { letter: 'D', text: 'In `localStorage`, so it survives a reload' },
      ],
      answer: 'B',
      explanation:
        'Storing the filtered list is two copies of the truth: change the sort, and the search silently disappears.',
    },
    {
      prompt: 'What is a function like `visiblePeople()` allowed to touch?',
      options: [
        { letter: 'A', text: 'The DOM, so it can render as it filters' },
        { letter: 'B', text: 'Nothing but values: data and state in, an array out' },
        { letter: 'C', text: 'The event object that triggered it' },
        { letter: 'D', text: 'The state, which it updates as it goes' },
      ],
      answer: 'B',
      explanation:
        'Pure logic first: no DOM, callable from the console, provably working before anything is on screen. It is the part a real project would unit-test.',
    },
    {
      prompt: 'Sorting names that contain accents — what do you use?',
      options: [
        { letter: 'A', text: '`a.name < b.name`' },
        { letter: 'B', text: '`a.name.localeCompare(b.name)`' },
        { letter: 'C', text: '`a.name - b.name`' },
        { letter: 'D', text: '`a.name.toUpperCase() < b.name.toUpperCase()`' },
      ],
      answer: 'B',
      explanation:
        '`localeCompare` handles accents and case; `<` compares code points, and puts `Émile` after `Zoé`.',
    },
    {
      prompt: 'Why does changing the sort not lose the current search?',
      options: [
        { letter: 'A', text: 'Because the search text is stored in the input, and the input is not redrawn' },
        { letter: 'B', text: 'Because each handler changes only its own piece of state, and `render()` recomputes the list from all of it' },
        { letter: 'C', text: 'Because `sort` is a stable sort' },
        { letter: 'D', text: 'It does lose it — the search has to be re-applied by hand' },
      ],
      answer: 'B',
      explanation: 'Getting that for free is the whole point of the pattern.',
    },
  ],

  // Chapter 8 — Guided practice, project 4
  '11_social_network': [
    {
      code: { language: 'javascript', source: "likeButton.textContent = '♥ ' + (count + 1);" },
      prompt: 'It works on screen. Why is it a bug?',
      options: [
        { letter: 'A', text: '`textContent` cannot hold a number' },
        { letter: 'B', text: 'It puts a number on screen that exists nowhere in the state — the next `render()` wipes it' },
        { letter: 'C', text: '`♥` has to be written as an HTML entity' },
        { letter: 'D', text: 'It should be `innerHTML`, so the heart renders' },
      ],
      answer: 'B',
      explanation: 'Increment the state — `message.likes++` — then `render()`. The array knows; the screen finds out.',
    },
    {
      prompt: 'How do you identify the message a Delete button should remove?',
      options: [
        { letter: 'A', text: 'By its index in the array, captured when the row was created' },
        { letter: 'B', text: 'By its id, carried on the element with `data-id`' },
        { letter: 'C', text: 'By its position among the DOM children' },
        { letter: 'D', text: 'By its text content' },
      ],
      answer: 'B',
      explanation:
        'Indexes shift as soon as something above is removed — clicking row 2 deletes row 3. `crypto.randomUUID()` gives you an id for free; it is the same reason `key` exists in React and `:key` in Vue.',
    },
    {
      prompt: 'A user posts `<img src=x onerror="steal(document.cookie)">`. What decides whether that code runs?',
      options: [
        { letter: 'A', text: 'The browser’s built-in XSS filter' },
        { letter: 'B', text: 'Whether you wrote it with `textContent` (shown as characters) or `innerHTML` (parsed as HTML — it runs)' },
        { letter: 'C', text: 'The `Content-Type` header of the page' },
        { letter: 'D', text: 'Nothing — `onerror` never fires on an image that fails to load' },
      ],
      answer: 'B',
      explanation:
        'Any string that came from a user is hostile until proven otherwise. `innerHTML` costs you a stored XSS: the visitor’s session, handed to whoever posted the message.',
    },
    {
      prompt: 'What does `render()` do each time it runs?',
      options: [
        { letter: 'A', text: 'Updates only the parts of the page that changed' },
        { letter: 'B', text: 'Empties the container and rebuilds it from the state, every time' },
        { letter: 'C', text: 'Runs once at startup, then handlers patch the page' },
        { letter: 'D', text: 'Reads the DOM to work out what needs changing' },
      ],
      answer: 'B',
      explanation:
        'Slower on paper, immune to two parts of the screen disagreeing — and the first display goes through the same function as every other one.',
    },
  ],
};
