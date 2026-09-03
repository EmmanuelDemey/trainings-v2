// Test suite for this workshop — you do not need to modify it.
// Each test is evaluated in isolation: an unimplemented function fails its own
// tests without stopping the others.

(function runTests() {
  let passed = 0;
  let total = 0;

  function test(label, compute, expected) {
    total++;
    let actual;
    try {
      actual = compute();
    } catch (error) {
      console.error(`❌ ${label}\n   threw: ${error.message}`);
      return;
    }
    if (equal(actual, expected)) {
      passed++;
      console.log(`✅ ${label}`);
    } else {
      console.error(`❌ ${label}\n   expected: ${show(expected)}\n   received: ${show(actual)}`);
    }
  }

  function equal(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every((item, i) => equal(item, b[i]));
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const keys = Object.keys(b);
      return keys.length === Object.keys(a).length && keys.every((k) => equal(a[k], b[k]));
    }
    return Object.is(a, b);
  }

  const show = (value) => JSON.stringify(value) ?? String(value);

  // 1 — isEven
  test('isEven(4) is true', () => isEven(4), true);
  test('isEven(7) is false', () => isEven(7), false);
  test('isEven(0) is true', () => isEven(0), true);
  test('evens keeps only even numbers', () => evens([1, 2, 3, 4, 10, 11]), [2, 4, 10]);

  // 2 — celsiusToFahrenheit
  test('0°C is 32°F', () => celsiusToFahrenheit(0), 32);
  test('100°C is 212°F', () => celsiusToFahrenheit(100), 212);
  test('toFahrenheit maps an array', () => toFahrenheit([0, 100, -40]), [32, 212, -40]);

  // 3 — cartTotal
  const cart = [
    { label: 'Mug', price: 12, quantity: 2 },
    { label: 'Poster', price: 8.5, quantity: 1 },
    { label: 'Sticker', price: 1.5, quantity: 4 },
  ];
  test('cartTotal sums price x quantity', () => cartTotal(cart), 38.5);
  test('cartTotal of an empty cart is 0', () => cartTotal([]), 0);

  // 4 — fizzBuzz
  test('fizzBuzz(5)', () => fizzBuzz(5), ['1', '2', 'Fizz', '4', 'Buzz']);
  test('fizzBuzz(15) ends with FizzBuzz', () => fizzBuzz(15)[14], 'FizzBuzz');
  test('fizzBuzz(100) has 100 entries', () => fizzBuzz(100).length, 100);

  // 5 — sortByPrice
  const products = [{ name: 'B', price: 10 }, { name: 'A', price: 9 }, { name: 'C', price: 100 }];
  test('sortByPrice, cheapest first', () => sortByPrice(products).map((p) => p.name), ['A', 'B', 'C']);
  test('sortByPrice does not mutate its input', () => products.map((p) => p.name), ['B', 'A', 'C']);

  // 6 — capitalize / randomItem
  test("capitalize('ada')", () => capitalize('ada'), 'Ada');
  test("capitalize('')", () => capitalize(''), '');
  test("capitalize('aDA') lowercases the rest", () => capitalize('aDA'), 'Ada');
  const pool = ['a', 'b', 'c'];
  test('randomItem returns an item of the list', () => pool.includes(randomItem(pool)), true);
  test('randomItem can return every item', () =>
    new Set(Array.from({ length: 200 }, () => randomItem(pool))).size, 3);

  // 7 — chaining
  const users = [
    { name: 'Ada', age: 36 },
    { name: 'Grace', age: 45 },
    { name: 'Linus', age: 17 },
  ];
  test('adultNames', () => adultNames(users), ['Ada', 'Grace']);

  // 8 — summary (destructuring + template literal)
  test('summary uses the role given', () =>
    summary({ name: 'Ada', role: 'Engineer' }), 'Ada — Engineer');
  test("summary falls back to 'unknown'", () =>
    summary({ name: 'Zoé' }), 'Zoé — unknown');

  // 9 — withLike (copy, then override)
  const feed = [
    { id: 'a1', text: 'hello', likes: 0 },
    { id: 'b2', text: 'hi', likes: 3 },
  ];
  test('withLike increments the right message', () =>
    withLike(feed, 'a1').map((m) => m.likes), [1, 3]);
  test('withLike leaves the others alone', () =>
    withLike(feed, 'a1')[1].text, 'hi');
  test('withLike does not mutate its input', () =>
    feed.map((m) => m.likes), [0, 3]);

  // 10 — removeById
  test('removeById drops one message', () =>
    removeById(feed, 'a1').map((m) => m.id), ['b2']);
  test('removeById on an unknown id changes nothing', () =>
    removeById(feed, 'zz').length, 2);

  // 11 — bestScorer (Object.entries)
  test('bestScorer finds the highest', () =>
    bestScorer({ ada: 12, grace: 9, linus: 20 }), 'linus');
  test('bestScorer with a single entry', () => bestScorer({ zoe: 4 }), 'zoe');

  console.log(
    `%c${passed}/${total} tests passing`,
    `font-weight: bold; color: ${passed === total ? '#1f9d55' : '#d33a3a'}`,
  );
})();
