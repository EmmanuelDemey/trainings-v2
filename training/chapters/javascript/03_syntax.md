---
layout: cover
---

# 3 - JS syntax

---

# Declaring variables: `const` and `let`

- **`const`**: the wire cannot move ➜ **default choice**
- **`let`**: the wire can be reassigned
- **`var`**: legacy, do not use in new code

```javascript
const name = 'Ada';
name = 'Grace';        // ❌ TypeError: Assignment to constant variable

let counter = 0;
counter = counter + 1; // ✅

const user = { name: 'Ada' };
user.name = 'Grace';   // ✅ const protects the wire, not the object
```

> Rule of thumb: use `const` everywhere, switch to `let` only when you need to reassign.

---

# Conditions

```javascript
const age = 20;

if (age >= 18) {
  console.log('adult');
} else if (age >= 13) {
  console.log('teenager');
} else {
  console.log('child');
}
```

- Ternary operator for simple cases:

```javascript
const status = age >= 18 ? 'adult' : 'minor';
```

- Comparison operators: `===`, `!==`, `<`, `<=`, `>`, `>=`
- Logical operators: `&&` (and), `||` (or), `!` (not)

---

# Loops

```javascript
// Repeat n times
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}

// Iterate over an array — preferred
const fruits = ['apple', 'kiwi', 'mango'];
for (const fruit of fruits) {
  console.log(fruit);
}

// Repeat while a condition holds
let tries = 0;
while (tries < 3) {
  tries++;
}
```

- `break` exits the loop, `continue` skips to the next iteration

---

# Functions

- A **reusable block of code** with inputs (parameters) and an output (`return`)

```javascript
function add(a, b) {
  return a + b;
}

add(2, 3); // 5
```

- **Arrow function** syntax — very common:

```javascript
const add = (a, b) => {
  return a + b;
};

const double = (n) => n * 2; // implicit return
```

---

# Functions - parameters and return

```javascript
function greet(name = 'stranger') {  // default value
  return `Hello ${name}!`;
}

greet();        // 'Hello stranger!'
greet('Ada');   // 'Hello Ada!'
```

- A function without `return` returns `undefined`
- Functions are **values**: you can store them and pass them around

```javascript
const sayHi = greet;
sayHi('Grace');            // 'Hello Grace!'

function twice(fn) { fn(); fn(); }
twice(() => console.log('hi')); // callback
```

---

# Arrays

- An **ordered list** of values, index starts at **0**

```javascript
const fruits = ['apple', 'kiwi', 'mango'];

fruits.length      // 3
fruits[0]          // 'apple'
fruits[2]          // 'mango'
fruits[3]          // undefined

fruits.push('pear');    // add at the end
fruits.pop();           // remove the last
fruits.includes('kiwi') // true
fruits.indexOf('kiwi')  // 1
```

---

# Arrays - the essential methods

- These methods take a **function** and return a **new array**

```javascript
const prices = [10, 25, 8, 42];

prices.map((p) => p * 2);        // [20, 50, 16, 84]
prices.filter((p) => p > 9);     // [10, 25, 42]
prices.find((p) => p > 9);       // 10 (first match)
prices.some((p) => p > 40);      // true
prices.every((p) => p > 5);      // true

prices.forEach((p) => console.log(p)); // just iterate

prices.reduce((total, p) => total + p, 0); // 85
```

---

# Arrays - chaining

- Methods returning arrays can be **chained**

```javascript
const users = [
  { name: 'Ada', age: 36 },
  { name: 'Grace', age: 45 },
  { name: 'Linus', age: 17 },
];

const adultNames = users
  .filter((user) => user.age >= 18)
  .map((user) => user.name);

// ['Ada', 'Grace']
```

> `map` / `filter` do not modify the original array — they create a new one.

---

# Hands-on

## Workshop 3 - Functions and arrays
- Write a function `isEven(n)` and use it in a `filter`
- Write a `celsiusToFahrenheit(c)` function and convert an array of temperatures with `map`
- Compute the total price of a shopping cart with `reduce`
- FizzBuzz: loop from 1 to 100, print `Fizz` / `Buzz` / `FizzBuzz`
