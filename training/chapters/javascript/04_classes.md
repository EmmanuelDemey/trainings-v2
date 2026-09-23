---
layout: cover
---

# 4 - Classes

---

# The problem: data, and the rules that guard it

```javascript
const account = { owner: 'Ada', balance: 100 };

function withdraw(account, amount) {
  if (amount > account.balance) throw new Error('insufficient funds');
  account.balance -= amount;
}

account.balance = -1_000_000;   // 💥 nothing forces anyone through withdraw()
```

- The rule lives in a function, the data in an object: **nothing ties them**
- Every piece of code that holds the object can skip the rule
- A **class** puts the data and its rules in one place — and can **lock** the data

> A class is a **mould**: written once, and `new` makes as many objects as you need.

---

# `class`, `constructor`, `new`

```javascript
class Account {
  constructor(owner, balance = 0) {
    this.owner = owner;      // this = the object being built
    this.balance = balance;
  }

  deposit(amount) {
    this.balance += amount;
  }
}

const ada = new Account('Ada', 100);
const grace = new Account('Grace');
ada.deposit(50);             // ada.balance = 150, grace.balance = 0
```

- `new` creates an empty object, runs `constructor` with `this` on it, returns it
- A method is written **once** and shared by every instance
- `Account('Ada')` without `new` ➜ `TypeError: Class constructor Account cannot be invoked without 'new'`
- A class name is **PascalCase**, by convention

---

# Fields

```javascript
class Counter {
  count = 0;                 // a public field — one per instance
  step;                      // declared, undefined until set

  constructor(step = 1) {
    this.step = step;
  }

  increment() {
    this.count += this.step;
    return this.count;
  }
}
```

- The fields give the **shape** of the object at a glance, at the top
- Their initial value is evaluated **at each** `new`: `items = []` gives every
  instance its own array
- The body of a class is always in **strict mode**

---

# Getters and setters

```javascript
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  get fahrenheit() {                 // read like a property
    return this.celsius * 9 / 5 + 32;
  }

  set fahrenheit(value) {            // assigned like a property
    this.celsius = (value - 32) * 5 / 9;
  }
}

const t = new Temperature(100);
t.fahrenheit;        // 212 — no parentheses
t.fahrenheit = 32;   // t.celsius is now 0
```

- A **computed** value that reads like stored data
- A setter is the place to **validate**: it runs on every assignment, even `this.x = …` in the constructor
- A getter without a setter is **read-only**: assigning throws in strict mode, is silently ignored otherwise

---

# Private fields: `#`

```javascript
class Account {
  #balance = 0;                      // private — the # is part of the name

  constructor(owner, balance) {
    this.owner = owner;
    this.#balance = balance;
  }

  get balance() {                    // public read, no public write
    return this.#balance;
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('insufficient funds');
    this.#balance -= amount;
  }
}

const ada = new Account('Ada', 100);
ada.balance;               // 100
ada.balance = 1_000_000;   // no setter ➜ refused
ada.#balance;              // ❌ SyntaxError — before a single line runs
```

---

# What `#` really hides

- `#balance` exists **only inside the class body** — it is not a property:
  `Object.keys(ada)` ➜ `['owner']`, `JSON.stringify(ada)` ➜ `{"owner":"Ada"}`
- It must be **declared** in the body: no adding one on the fly
- A typo is caught **at load**: `this.#balanse` is a `SyntaxError`, not a silent `undefined`
- Methods can be private too: `#assertPositive(amount) { … }`

| | `_balance` | `#balance` |
|---|---|---|
| Other code can read and write it | ✅ it is only a naming convention | ❌ enforced by the language |
| In `Object.keys`, `JSON`, `{ ...spread }` | ✅ | ❌ |
| Shown in the devtools | ✅ | ✅ for debugging — still unreachable from code |

> Private is about **who may break the rule**: nobody outside the class.

---

# Static members

```javascript
class Account {
  static #opened = 0;
  #balance = 0;

  constructor(owner) {
    this.owner = owner;
    Account.#opened++;
  }

  static get opened() { return Account.#opened; }

  static isAccount(value) {
    return #balance in value;        // true only for a real Account
  }
}

Account.isAccount(new Account('Ada')); // true
Account.isAccount({ balance: 100 });   // false — same shape, not an Account
Account.opened;                        // 1
```

- `static` belongs to the **class**, not to its instances: `ada.isAccount` is `undefined`
- Typical uses: factories (`Temperature.fromFahrenheit(212)`), constants, counters, checks
- `#field in object` is the one reliable "is this really one of mine?"

---

# Inheritance: `extends` and `super`

```javascript
class SavingsAccount extends Account {
  constructor(owner, balance, rate) {
    super(owner, balance);             // ⚠️ before any use of this
    this.rate = rate;
  }

  addInterest() {
    this.deposit(this.balance * this.rate); // inherited, public
  }

  withdraw(amount) {                   // override…
    if (amount > 1000) throw new RangeError('1000 per withdrawal at most');
    super.withdraw(amount);            // …and reuse the original
  }
}
```

- `super(...)` runs the parent constructor — `this` does not exist before it
- `super.method()` calls the parent's version of a method you override
- A child **cannot** read the parent's `#balance`: it goes through `balance` and
  `deposit`, like everyone else

---

# The subclass you will write for sure: an error

```javascript
class InsufficientFundsError extends Error {
  constructor(missing) {
    super(`insufficient funds: ${missing} missing`);
    this.name = 'InsufficientFundsError';
    this.missing = missing;
  }
}

try {
  ada.withdraw(500);
} catch (error) {
  if (!(error instanceof InsufficientFundsError)) throw error; // not ours: let it go up
  console.warn(`You need ${error.missing} more`);
}
```

- An error **you can tell apart** from the others, carrying its own data
- `instanceof` walks up the chain: it is still an `Error`, with a `stack`
- Set `name`: it is what the console prints in front of the message

---

# Under the hood: prototypes

```javascript
typeof Account;                                    // 'function'
Object.getPrototypeOf(ada) === Account.prototype;  // true
Object.hasOwn(ada, 'withdraw');                    // false — found on the prototype
ada instanceof Account;                            // true
```

- A class is a **function**; its methods live once on `Account.prototype`
- `ada.withdraw` is looked up on `ada`, then on its prototype, then on `Object.prototype`
- `extends` links one prototype to the next — the chain `instanceof` follows

> `class` (ES2015) is a clearer syntax over what already existed:
> `function Account() {}` and `Account.prototype.withdraw = function () {}`.
> Old code and old tutorials are full of it.

---

# Hands-on

## Workshop 4 - Modelling a bank account

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/04_classes/</code> — open <code>index.html</code>, steps in its <code>README.md</code></div>

- A `Counter`: a public field, two methods, `new`
- A `BankAccount` whose balance is **private**, read through a getter
- A setter that validates the owner, a private method that guards every amount
- An `InsufficientFundsError` you can catch by its type, and a private history
- A `static` check built on `#balance in value`, and a `SavingsAccount` that `extends` it

---
layout: cover
---

# End of Day 1

---

# What you can do now

- Read a snippet and **predict** what it does, without running it
- Explain why `{} === {}` is `false`, and why `'2' === 2` is too
- Choose between `const` and `let`, and say what `const` really protects
- Write a function, give it a default parameter, pass it to another function
- Transform an array with `map`, `filter`, `reduce`, `sort` instead of a loop
- Read, build and **copy** an object, and update one of its properties without
  touching the original
- Find, update and remove one item of an array of objects, **by id**
- Write a class that keeps its data **private**, and extend it with `extends`

<br />

## Tomorrow

The browser: `window`, the **DOM**, **events**, and responsive behaviour —
everything that turns the code you just wrote into an interface.

> If one of the points above is still fuzzy, say so tomorrow morning.
> Day 2 builds directly on top of them.
