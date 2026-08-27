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
