# TP 3 — Functions and arrays

> Autonomous workshop — chapter 3 (JS syntax). ~1h45.

## Goal

Write functions, and drive arrays **of objects** with `map` / `filter` /
`reduce` / `sort` instead of hand-rolled loops. This is the workshop that makes
Day 2 and Day 3 possible: every project of Day 3 is "an array of objects, a
transformation, a render".

## Setup

Open `index.html` with the console visible. The page runs a small test suite
over your functions and prints ✅ / ❌ per task, then a score.

## Steps

1. **`isEven(n)`** — returns `true` for an even number. Then use it with
   `filter` to keep the even numbers of an array. Write the `for` loop version
   too, and compare the two out loud.
2. **`celsiusToFahrenheit(c)`** — `f = c * 9 / 5 + 32`. Convert a whole array of
   temperatures with `map`.
3. **`cartTotal(items)`** — an array of `{ label, price, quantity }`, one number
   out, with `reduce`. Watch the initial value.
4. **`fizzBuzz(n)`** — returns the array of the `n` first FizzBuzz entries:
   numbers as strings, `'Fizz'`, `'Buzz'`, `'FizzBuzz'`. Get the order of the
   tests right — `15` is the case everybody gets wrong.
5. **`sortByPrice(items)`** *(prepares Day 3)* — sorts a copy, cheapest first.
   `sort` mutates and compares as strings by default: both traps are the lesson.
6. **`capitalize(word)`** and **`randomItem(list)`** *(prepares Day 3)* — string
   slicing, and `Math.random()`. Day 3's password generator is built on these.
7. **Chaining** — `adultNames(users)`: filter the adults, then map to their
   names, in one expression.
8. **`summary(person)`** *(prepares Day 3)* — destructure `{ name, role }` in
   the signature, give `role` a default, and build the string with a template
   literal.
9. **`withLike(messages, id)`** *(prepares Day 3)* — one more like on one
   message, **without touching** the array you were given: `map`, and
   `{ ...message, likes: ... }` for the one that matches. This exact function is
   in mini-project 4.
10. **`removeById(messages, id)`** — the same list, minus one, **by id**.
11. **`bestScorer(scores)`** — an object `{ ada: 12, ... }` in, the winning name
    out. `Object.entries` turns it back into an array, and everything above
    applies again.

## Checking your work

The console ends with `29/29 tests passing`. A ❌ prints what your function
returned next to what was expected.

## Going further

- Rewrite task 3 with a `for...of` loop, and task 1 with a `for` loop. Which one
  reads better once there are three of them chained?
- `reduce` is not only for sums: use it to group the cart items by first letter.
- `toSorted()` is the non-mutating `sort()` — check its browser support, then
  decide whether you can use it in the projects.
- What does `[10, 9, 1].sort()` return, and why is that the correct behaviour?
- Write `countByTeam(people)`: an array of `{ name, team }` in, an object
  `{ core: 3, design: 1 }` out. `reduce` with an object as the accumulator.
- In task 9, replace the spread with `message.likes++` on the found item. Which
  test breaks, and why is that test the whole point?
