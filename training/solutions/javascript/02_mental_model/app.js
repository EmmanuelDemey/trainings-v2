// TP 2 - Sketching snippets — solution
//
// The point of this workshop is the diagram, not the answer. Each comment below
// is what should be said out loud while drawing it on the board.

console.group('Snippets');

// --- Snippet 1 — primitives are copied by value ---------------------------
// Two wires, two values. `b = a` reads the value a currently points at (10) and
// points b at it. Moving a's wire to 20 afterwards cannot drag b along: nothing
// connects the two wires, only the value they happened to share.
let a = 10;
let b = a;
a = 20;
predict('b', b, 10);

// --- Snippet 2 — objects are shared -------------------------------------
// Same diagram, one crucial difference: the value both wires point at is a
// single object. `admin.name = 'Grace'` does not move a wire, it edits the
// value at the end of it — and `user` is looking at that same value.
// This is THE source of "why did my other variable change?" bugs.
const user = { name: 'Ada' };
const admin = user;
admin.name = 'Grace';
predict('user.name', user.name, 'Grace');

// --- Snippet 3 — const protects the wire, not the value ------------------
// `const` forbids `scores = somethingElse`. It says nothing about the array
// itself. Beginners read const as "immutable"; it means "not reassignable".
const scores = [1, 2];
scores.push(3);
predict('scores.length', scores.length, 3);

// --- Snippet 4 — reading what is not there --------------------------------
// Reading a missing property is NOT an error: you get undefined. Which is why
// the crash always happens one line later, on `config.language.toUpperCase()`.
const config = { theme: 'dark' };
predict('config.language', config.language, undefined);
predict('typeof config.language', typeof config.language, 'undefined');

// --- Snippet 5 — equality and types ---------------------------------------
// === compares without converting: a string is never a number.
// NaN is the one value not equal to itself — it is the spec's way of saying
// "this is not a usable number". Test it with Number.isNaN(), never with ===.
predict("'2' === 2", '2' === 2, false);
predict('NaN === NaN', NaN === NaN, false);

// --- Snippet 6 — two objects that look the same ---------------------------
predict('{} === {}', {} === {}, false);
// Answer: each `{}` literal creates a NEW object, so there are two values here,
// at two different places in memory. `===` on objects asks "is it the same
// value?", never "do they look alike?" — there are two boxes on the diagram, so
// the answer is false. (Comparing content is a function you write yourself, or
// a JSON.stringify hack, or structuredClone-era deep-equal helpers.)

console.groupEnd();
report('predictions correct');

// --- Truthy / falsy --------------------------------------------------------
console.group('Truthy / falsy');

// The `if` does the conversion for us — which is exactly the point: there is no
// separate "truthiness function" in the language, it is what `if` already does.
// The list of falsy values is short and worth memorising:
//   false, 0, -0, 0n, '', null, undefined, NaN. Everything else is truthy,
//   including '0', ' ', [] and {} — the three that trip everyone up.
function isTruthy(value) {
  if (value) {
    return true;
  }
  return false;
}

[
  [0, false],
  [1, true],
  ['', false],
  ['0', true],   // a non-empty string, even one containing a zero
  [' ', true],   // a space is a character
  [null, false],
  [undefined, false],
  [NaN, false],
  [[], true],    // an empty array is still an object
  [{}, true],
  [-1, true],    // only ZERO is falsy, not "negative"
  [false, false],
].forEach(([value, expected]) => {
  predict(`isTruthy(${format(value)})`, isTruthy(value), expected);
});

console.groupEnd();
report('classified');
