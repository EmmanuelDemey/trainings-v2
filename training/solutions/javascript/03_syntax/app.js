// TP 3 - Functions and arrays — solution

// --- 1. isEven -------------------------------------------------------------
// `n % 2 === 0` and not `!(n % 2)`: the comparison says what we mean, and does
// not rely on 0 being falsy. Beginners should read the intent, not the trick.
function isEven(n) {
  return n % 2 === 0;
}

// filter takes a function and calls it once per item. It keeps the items for
// which that function returned something truthy — here, exactly isEven.
// Note we pass the function itself (`isEven`), we do not call it (`isEven()`).
function evens(numbers) {
  return numbers.filter(isEven);
}

// The loop version, for the comparison asked for in the README:
//   const result = [];
//   for (const n of numbers) { if (isEven(n)) result.push(n); }
//   return result;
// Four lines, a mutable accumulator, and the intent ("keep the even ones")
// buried in the middle. filter is one line and names the intent.

// --- 2. Temperatures -------------------------------------------------------
function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

// map returns a NEW array of the same length, one output per input.
function toFahrenheit(temperatures) {
  return temperatures.map(celsiusToFahrenheit);
}

// --- 3. Shopping cart ------------------------------------------------------
// reduce is the one that folds a list into a single value. The second argument,
// 0, is the starting accumulator — and it is what makes the empty cart return 0
// instead of throwing "Reduce of empty array with no initial value".
function cartTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// --- 4. FizzBuzz -----------------------------------------------------------
// The whole exercise is the ORDER of the conditions: test the 15 case first,
// otherwise `n % 3 === 0` catches 15 and returns 'Fizz'. Testing both divisions
// (rather than `n % 15`) says why 15 is special, instead of hiding it.
function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      result.push('FizzBuzz');
    } else if (i % 3 === 0) {
      result.push('Fizz');
    } else if (i % 5 === 0) {
      result.push('Buzz');
    } else {
      result.push(String(i));
    }
  }
  return result;
}
// Array-first alternative, once map is comfortable:
//   return Array.from({ length: n }, (_, index) => label(index + 1));

// --- 5. Sorting (prepares Day 3) -------------------------------------------
// [...items] copies the array before sorting, because sort() mutates in place —
// the second test in check.js exists only to catch that.
// The comparator: negative if a comes first, positive if b does. On numbers,
// `a - b` gives exactly that. Without it, sort() compares string forms and
// [10, 9, 1] becomes [1, 10, 9] — a real bug, seen in production, regularly.
function sortByPrice(items) {
  return [...items].sort((a, b) => a.price - b.price);
}
// On strings, use `a.name.localeCompare(b.name)` — it handles accents and case
// properly, which `<` does not ('É' < 'a' in code-point order).
// Modern alternative: `items.toSorted((a, b) => a.price - b.price)` — same
// result, no copy needed, available since Chrome/Safari/Firefox 2023.

// --- 6. Strings and randomness (prepares Day 3) ----------------------------
// slice(1) returns everything from index 1 — on '' it returns '', which is why
// the empty-string case works without a special `if`.
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Math.random() is in [0, 1[ — it never returns 1, so multiplying by the length
// and flooring gives a valid index every time, 0 included, length excluded.
function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}
// Not cryptographically random: fine for picking an avatar, NOT for a password
// you would actually use. Day 3 mentions crypto.getRandomValues() for that.

// --- 7. Chaining -----------------------------------------------------------
// Read it top to bottom: "take the users, keep the adults, take their names".
// filter returns an array, so map can be called straight on it.
function adultNames(users) {
  return users.filter((user) => user.age >= 18).map((user) => user.name);
}

// --- 8. Objects: destructuring (prepares Day 3) ----------------------------
// Destructuring in the signature: the function announces the two properties it
// reads. Passing a person with ten other keys changes nothing here — and the
// reader does not have to go hunting through the body to find out what is used.
// `= 'unknown'` fires on a MISSING key (undefined), not on an empty string.
function summary({ name, role = 'unknown' }) {
  return `${name} — ${role}`;
}
// Without destructuring: `return person.name + ' — ' + (person.role ?? 'unknown')`.
// Same result, and every added property means another `person.` to read.

// --- 9. Objects: copy, then override (prepares Day 3) ----------------------
// map rebuilds the array; the ternary decides, per item, between a new object
// and the original one. `{ ...message, likes: ... }` copies every property,
// then the later key wins — order matters, the override goes last.
function withLike(messages, id) {
  return messages.map((message) =>
    message.id === id ? { ...message, likes: message.likes + 1 } : message,
  );
}
// Why not `message.likes++` on the item found? It works, and it silently edits
// the array the caller handed us — the third test catches exactly that. Copying
// is also what React and Vue rely on to notice a change: they compare
// references, and a mutated object is still the same reference.
//
// The copy is SHALLOW: `{ ...message }` shares any nested object. Keeping the
// state flat, as Day 3 does, is what makes that a non-issue.

// --- 10. Objects in an array: remove by id ---------------------------------
function removeById(messages, id) {
  return messages.filter((message) => message.id !== id);
}
// filter, not splice: splice mutates, and it takes an index. An index is only
// true until something above it is removed — which is precisely what a delete
// button does. The id stays true whatever happens to the list.

// --- 11. Going through an object -------------------------------------------
// Object.entries turns { ada: 12 } into [['ada', 12]] — an array, so every
// method of task 1 to 7 applies again. The pair is destructured by position in
// the parameters: [name, score].
function bestScorer(scores) {
  return Object.entries(scores).reduce(
    (best, [name, score]) => (score > scores[best] ? name : best),
    Object.keys(scores)[0],
  );
}
// The initial value is the first key, not '' — comparing against scores[''] is
// undefined, and every comparison with undefined is false, so the reduce would
// return '' for good.
// Readable alternative, if reduce still hurts:
//   let best = Object.keys(scores)[0];
//   for (const [name, score] of Object.entries(scores)) {
//     if (score > scores[best]) best = name;
//   }
//   return best;
