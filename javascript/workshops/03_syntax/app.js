// TP 3 - Functions and arrays
// Implement every function below. check.js runs the tests on reload.

// --- 1. isEven -------------------------------------------------------------
// TODO: return true when n is even.
//   Hint: the remainder operator is `%`.
function isEven(n) {}

// TODO: return a NEW array with only the even numbers of `numbers`.
//   Use filter and isEven — no loop.
function evens(numbers) {}

// --- 2. Temperatures -------------------------------------------------------
// TODO: convert celsius to fahrenheit — f = c * 9 / 5 + 32
function celsiusToFahrenheit(c) {}

// TODO: convert a whole array with map.
function toFahrenheit(temperatures) {}

// --- 3. Shopping cart ------------------------------------------------------
// TODO: total of the cart, with reduce.
//   items looks like [{ label: 'Mug', price: 12, quantity: 2 }, ...]
//   Do not forget the initial value of the accumulator.
function cartTotal(items) {}

// --- 4. FizzBuzz -----------------------------------------------------------
// TODO: return an array of n entries.
//   multiple of 3 -> 'Fizz', of 5 -> 'Buzz', of both -> 'FizzBuzz',
//   otherwise the number AS A STRING.
//   Careful with the order of your conditions.
function fizzBuzz(n) {}

// --- 5. Sorting (prepares Day 3) -------------------------------------------
// TODO: return a copy of `items` sorted by ascending price.
//   Two traps: sort() modifies the array it is called on (copy it first, with
//   [...items]), and without a comparison function it sorts as STRINGS.
//   A comparator returns a negative number, 0, or a positive number.
function sortByPrice(items) {}

// --- 6. Strings and randomness (prepares Day 3) ----------------------------
// TODO: 'ada' -> 'Ada', 'aDA' -> 'Ada', '' -> ''.
//   Hint: charAt / slice / toUpperCase / toLowerCase.
function capitalize(word) {}

// TODO: return one item of the list, picked at random.
//   Hint: Math.random() gives a decimal in [0, 1[, Math.floor rounds down.
function randomItem(list) {}

// --- 7. Chaining -----------------------------------------------------------
// TODO: from an array of { name, age }, return the names of the 18+, in order.
//   One expression: filter then map.
function adultNames(users) {}

// --- 8. Objects: destructuring (prepares Day 3) ----------------------------
// TODO: from a { name, role } object, return 'Ada — Engineer'.
//   Destructure the parameter, and give `role` the default value 'unknown'
//   so that summary({ name: 'Zoé' }) returns 'Zoé — unknown'.
//   The dash is an em dash: —
function summary(person) {}

// --- 9. Objects: copy, then override (prepares Day 3) ----------------------
// TODO: return a NEW array where the message with this id has one more like.
//   The others come back untouched, and `messages` itself must NOT change:
//   map over it, and for the matching one build { ...message, likes: ... }.
//   This is THE pattern of Day 3 — the third test is the one that matters.
function withLike(messages, id) {}

// --- 10. Objects in an array: remove by id ---------------------------------
// TODO: return a NEW array without the message carrying this id.
//   By id, never by index: splice(index, 1) is how you delete the wrong one.
function removeById(messages, id) {}

// --- 11. Going through an object -------------------------------------------
// TODO: scores looks like { ada: 12, grace: 9, linus: 20 }.
//   Return the NAME with the highest score -> 'linus'.
//   Hint: Object.entries gives you [['ada', 12], ...] — an array again, so
//   reduce (or a for...of) works on it.
function bestScorer(scores) {}
